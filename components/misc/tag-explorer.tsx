import { getAllTags } from '@/lib/api';
import Link from 'next/link';

const allTags = getAllTags();

const TagExplorer = () => {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-lg font-bold leading-snug">Tag Explorer</h4>

      {allTags.map(tag => (
        <Link key={tag} as={`/tags/${tag}`} href="/tags/[...tag]">#{tag}</Link>
      ))}
    </div>
  );
};

export default TagExplorer;
