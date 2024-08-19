import Backlinks from '@/components/misc/backlinks';
import Layout from '@/components/misc/layout';
import TagExplorer from '@/components/misc/tag-explorer';
import Author from '@/interfaces/author';
import PostBody from './post-body';
import PostMeta from './post-meta';

type Props = {
  title: string,
  content: string,
  date?: string,
  author?: Author,
  backlinks: { [k: string]: {
      title: string,
      excerpt: string,
    }
  },
}

function PostSingle({
  title,
  date,
  author,
  content,
  backlinks,
}: Props) {
  return (
    <Layout
      sidebar={(
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-lg font-bold leading-snug mb-4">Backlinks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {
                (Object.keys(backlinks).length > 0) ? (
                    <Backlinks backlinks={backlinks} />
                ) : (<p className="text-base">No backlinks.</p>)
              }
            </div>
          </div>

          <TagExplorer />
        </div>
      )}
    >
      <article>
        {/* Article header */}
        <header className="max-w-3xl mx-auto mb-20">
          {/* Title */}
          <h1 className="h1 text-center mb-4 text-6xl">{title}</h1>
        </header>

        {/* Article meta */}
        {(author || date) && (
          <>
            <PostMeta author={author} date={date}/>
            <hr className="w-16 h-px pt-px bg-gray-200 border-0 my-6" />
          </>
        )}

        {/* Article body */}
        <PostBody content={content}/>
      </article>
    </Layout>
  );
}

export default PostSingle;
