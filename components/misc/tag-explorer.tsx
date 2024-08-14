import Link from 'next/link';

const TagExplorer = ({ tags }: { tags: string[] }) => {
  return (
    <>
      {tags.map(tag => (
        <Link key={tag} as={`/tags/${tag}`} href="/tags/[...tag]">#{tag}</Link>
      ))}
    </>
  );
};

export default TagExplorer;
