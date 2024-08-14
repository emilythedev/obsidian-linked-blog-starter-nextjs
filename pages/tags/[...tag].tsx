import path from 'path';
import PostPreview from '../../components/blog/post-preview';
import Layout from '../../components/misc/layout';
import { getAllPosts, getAllTags } from '../../lib/api';

type Item = {
  title: string,
  excerpt: string,
  date: string,
  slug: string,
  tags: string[],
}

export default function List({ posts, tag }: { posts: Item[], tag: string }) {
  return (
    <Layout>
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
    </Layout>
  );
}

type Params = {
  params: {
    tag: string[],
  },
};

export async function getStaticProps({ params }: Params) {
  const tag = params.tag.join(path.sep);
  const posts = await getAllPosts([
    'title',
    'excerpt',
    'date',
    'slug',
    'tags',
  ]);

  return {
    props: {
      posts: posts.filter((post) => {
        return (post.tags as string[]).includes(tag);
      }),
      tag,
    },
  }
}

export async function getStaticPaths() {
  const tags = await getAllTags()
  return {
    paths: tags.map((tag) => {
      return {
        params: {
          tag: tag.split(path.sep),
        },
      }
    }),
    fallback: false,
  }
}
