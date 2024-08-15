import path from 'path';
import PostPreview from '../../../components/blog/post-preview';
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
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto lg:max-w-none">
            <h1 className="h1 text-center mb-4 text-6xl">#{tag}</h1>

            <div className="lg:flex">
              <div className="lg:flex-1">
                {posts.map(post => (
                  <PostPreview
                    key={post.slug}
                    title={post.title}
                    date={post.date}
                    excerpt={post.excerpt}
                    slug={post.slug}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
