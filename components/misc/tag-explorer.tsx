import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TagNode from '@/interfaces/tag';
import { getAllTags, getTagNodes } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const allTags = getAllTags();
const nodes = getTagNodes(allTags);

interface TagNodeProps {
  node: TagNode,
}

const TagLink = ({ node, className }: TagNodeProps & { className?: string }) => {
  return (
    <Link
      className={cn('px-3', className)}
      as={`/tags/${node.fullPath}`}
      href="/tags/[...tag]"
    >
      <span>#{node.label}</span>
    </Link>
  );
};

const CollapsibleTagNode = ({ node }: TagNodeProps) => {
  if (node.children.length === 0) {
    return (
      <div className="flex items-center mb-4">
        <TagLink node={node} />
      </div>
    );
  }

  return (
    <Collapsible>
      <div className="flex items-center mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0 [&[data-state=closed]>svg]:-rotate-90">
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <TagLink node={node} className="pl-0" />
      </div>
      <CollapsibleContent className="flex flex-col pl-6">
        {node.children.map(child => (<CollapsibleTagNode key={child.fullPath} node={child} />))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const TagExplorer = () => {
  return (
    <div className="flex flex-col">
      <h4 className="text-lg font-bold leading-snug mb-4">Tag Explorer</h4>

      {nodes.children.map(node => (
        <CollapsibleTagNode key={node.fullPath} node={node} />
      ))}
    </div>
  );
};

export default TagExplorer;
