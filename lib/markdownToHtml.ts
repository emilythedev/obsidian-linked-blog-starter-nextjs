import NotePreview from '@/components/misc/note-preview'
import { fromHtml } from 'hast-util-from-html'
import { Element } from 'hast-util-select'
import { createElement } from 'react'
import rehypeRewrite from 'rehype-rewrite'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { Root } from 'rehype-stringify/lib'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import removeMd from 'remove-markdown'
import { unified } from 'unified'
import { getLinksMapping, getPostBySlug, getSlugFromHref, updateMarkdownLinks } from './api'


export async function markdownToHtml(markdown: string, currSlug: string) {
  markdown = updateMarkdownLinks(markdown, currSlug);

  // get mapping of current links
  const links = (getLinksMapping())[currSlug] as string[]
  const linkNodeMapping = new Map<string, Element>();
  const createLinkNodePromises: Promise<Root>[] = [];
  for (const l of links) {
    const post = getPostBySlug(l, ['title', 'content']);
    createLinkNodePromises.push(
      createNoteNode(post.title, post.content)
        .then(node => {
          linkNodeMapping[l] = node;
          return node;
        })
    );
  }

  await Promise.all(createLinkNodePromises);

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeRewrite, {
      selector: 'a',
      rewrite: async (node) => rewriteLinkNodes(node, linkNodeMapping, currSlug)
    })
    .use(rehypeStringify)
    .process(markdown)
  let htmlStr = file.toString()
  return htmlStr;
}

export function getMDExcerpt(markdown: string, length: number = 500) {
  const text = removeMd(markdown, {
    stripListLeaders: false,
    gfm: true,
  }) as string
  return text.slice(0, length).trim();
}

export async function createNoteNode(title: string, content: string) {
  const { renderToStaticMarkup } = await import('react-dom/server')
  const mdContentStr = getMDExcerpt(content);
  const htmlStr = renderToStaticMarkup(createElement(NotePreview, { title, content: mdContentStr }))
  const noteNode = fromHtml(htmlStr);
  return noteNode;
}

function rewriteLinkNodes (node, linkNodeMapping: Map<string, any>, currSlug) {
  if (node.type === 'element' && node.tagName === 'a') {
    const slug = getSlugFromHref(currSlug, node.properties.href)
    const noteCardNode = linkNodeMapping[slug]
    if (noteCardNode) {
      const anchorNode = {...node}
      anchorNode.properties.className = 'internal-link'
      node.tagName = 'span'
      node.properties = { className: 'internal-link-container' }
      node.children = [
        anchorNode,
        noteCardNode
      ]
    }
  }
}
