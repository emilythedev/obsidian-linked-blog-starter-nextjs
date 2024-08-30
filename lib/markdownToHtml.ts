import NotePreview from '@/components/misc/note-preview'
import { fromHtml } from 'hast-util-from-html'
import { Root as HastNode } from 'hast-util-from-html/lib'
import { raw } from 'hast-util-raw'
import { Element } from 'hast-util-select'
import { findAndReplace } from 'mdast-util-find-and-replace'
import { Root as MdastRoot, PhrasingContent } from 'mdast-util-find-and-replace/lib'
import { toHast } from 'mdast-util-to-hast'
import { createElement } from 'react'
import rehypeRewrite from 'rehype-rewrite'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import removeMd from 'remove-markdown'
import { unified } from 'unified'
import { getLinksMapping, getPostBySlug, getSlugFromHref, updateMarkdownLinks } from './api'
import { HIGHLIGHT_REGEX, TAG_IN_NODE_REGEX } from './constants'

export async function markdownToHtml(markdown: string, currSlug: string) {
  markdown = updateMarkdownLinks(markdown, currSlug);

  // get mapping of current links
  const links = (getLinksMapping())[currSlug] as string[]
  const linkNodeMapping = new Map<string, Element>();
  const createLinkNodePromises: Promise<HastNode>[] = [];
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
    .use(() => {
      return (tree: MdastRoot, file) => {
        findAndReplace(tree, [
          [TAG_IN_NODE_REGEX, (tag: string, tagPath: string) => {
            const linkNode: PhrasingContent = {
              type: 'link',
              url: `/tags/${tagPath}`,
              data: {
                hProperties: {
                  className: ['tag-link'],
                },
              },
              children: [
                {
                  type: 'text',
                  value: tag.trimStart(),
                },
              ],
            };

            if (tag.startsWith(' ')) {
              return [
                { type: 'text', value: ' ' } as PhrasingContent,
                linkNode,
              ];
            }
            return linkNode;
          }],
          [HIGHLIGHT_REGEX, (_: string, text: string) => {
            return {
              type: 'html',
              value: `<span class="text-highlight">${text}</span>`,
            };
          }]
        ]);
      };
    })
    .use(remarkRehype, {
      handlers: {
        html: (state, node, parent) => {
          const convertedRoot = raw(toHast(node, { allowDangerousHtml: true })!)
          return convertedRoot.children[0]
        }
      },
    })
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        a: [
          ...(defaultSchema.attributes?.a || []),
          ['className', 'tag-link'],
        ],
        span: [
          ...(defaultSchema.attributes?.span || []),
          ['className', 'text-highlight'],
        ],
      },
    })
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
