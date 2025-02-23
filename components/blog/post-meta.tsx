import DateFormatter from "@/components/misc/date-formatter";
import Author from "@/interfaces/author";

type Props = {
  author?: Author,
  date?: string,
}

const PostMeta = ({
  author,
  date
}: Props) => {
  if (!(author || date)) return null;
  return (
    <>
      <div className="flex items-center">
        {author && typeof author !== 'string' && (
          <div className="flex shrink-0 mr-3">
            <a className="relative" href="#0">
              <span className="absolute inset-0 -m-px" aria-hidden="true"><span className="absolute inset-0 -m-px bg-white rounded-full"></span></span>
              <img className="relative rounded-full" src={author.picture} width="32" height="32" alt="Author" />
            </a>
          </div>
        )}
        <div>
          {author && (
            <>
              <span className="text-gray-600">By </span>
              <a className="font-medium hover:underline" href="#0">{typeof author === 'string' ? author : author.name}</a>
            </>
          )}
          {(author && date) && <span className="text-gray-600"> · </span>}
          {date && (<span className="text-gray-600"><DateFormatter dateString={date} /></span>)}
        </div>
      </div>
    </>
  )
}

export default PostMeta;
