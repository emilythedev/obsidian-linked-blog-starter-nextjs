import path from 'path';
import PostSingle from '../../components/blog/post-single';
import PostType from '../../interfaces/post';
import { getAllPosts, getLinksMapping, getPostBySlug } from '../../lib/api';
import { markdownToHtml } from '../../lib/markdownToHtml';

type Items = {
  title: string,
  excerpt: string,
}

const getPostAndBacklinks = async (slug: string) : Promise<{
  post: PostType,
  backlinks: { [k: string]: Items },
}> => {
  const post = getPostBySlug(slug, [
    'title',
    'excerpt',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
  ]) as PostType;
  const content = await markdownToHtml(post.content || '', slug)
  const linkMapping = getLinksMapping()
  const backlinks = Object.keys(linkMapping).filter(k => linkMapping[k].includes(post.slug) && k !== post.slug)
  const backlinkNodes = Object.fromEntries(await Promise.all(backlinks.map(async (slug) => {
    const post = getPostBySlug(slug, ['title', 'excerpt']);
    return [slug, post]
  })));

  return {
    post: {
      ...post,
      content,
    },
    backlinks: backlinkNodes,
  };
};

type Params = {
  slug: string[],
};

const Page = async ({ params }: { params: Params }) => {
  const { post, backlinks } = await getPostAndBacklinks(path.join(...params.slug.map(decodeURIComponent)));

  return (
    <PostSingle
      title={post.title}
      content={post.content}
      date={post.date}
      author={post.author}
      backlinks={backlinks}
    />
  );
};

export default Page;

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts(['slug']);
  return posts.map((post) => ({
    slug: post.slug.split(path.sep).map(encodeURIComponent),
  })) as Params[];
}
