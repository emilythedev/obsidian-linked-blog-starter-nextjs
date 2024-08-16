import path from 'path';
import PostPreview from '../../../components/blog/post-preview';
import Layout from '../../../components/misc/layout';
import { getAllPosts, getAllTags } from '../../../lib/api';

type Item = {
  title: string,
  excerpt: string,
  date: string,
  slug: string,
  tags: string[],
}

const posts = getAllPosts([
  'title',
  'excerpt',
  'date',
  'slug',
  'tags',
]) as Item[];

const getPosts = async (tag: string) : Promise<{
  posts: Item[],
  tag: string,
}> => {
  return {
    posts: posts.filter((post) => {
      return (post.tags as string[]).includes(tag);
    }),
    tag,
  };
};

type Params = {
  tag: string[],
};

const Page = async ({ params }: { params: Params }) => {
  const { posts, tag } = await getPosts(path.join(...params.tag.map(decodeURIComponent)));

  return (
    <Layout>
      <header className="max-w-3xl mx-auto mb-20">
        <h1 className="h1 text-center mb-4 text-6xl">#{tag}</h1>
      </header>

      {posts.map(post => (
        <PostPreview
          key={post.slug}
          title={post.title}
          date={post.date}
          excerpt={post.excerpt}
          slug={post.slug}
        />
      ))}
     </Layout>
  );
};

export default Page;

export const dynamicParams = false;

const tags = getAllTags();

export async function generateStaticParams() {
  return tags.map((tag) => ({
    tag: tag.split(path.sep).map(encodeURIComponent),
  })) as Params[];
}
