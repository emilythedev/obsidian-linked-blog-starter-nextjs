import TagNode from '@/interfaces/tag'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { TAG_IN_CONTENT_REGEX } from './constants'
import { getMDExcerpt } from './markdownToHtml'
import { getFilesRecursively } from './modules/find-files-recusively.mjs'

const mdDir = path.join(process.cwd(), process.env.COMMON_MD_DIR || '')

export function getPostBySlug(slug: string, fields: string[] = []) {
  const realSlug = slug.replace(/\.md(?:#[^\)]*)?$/, '')
  const fullPath = path.join(mdDir, `${realSlug}.md`)
  const data = parseFileToObj(fullPath);

  type Items = {
    [key: string]: any
  }

  const items: Items = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
  })
  return items
}

function parseFileToObj(pathToObj: string) {
  const fileContents = fs.readFileSync(pathToObj, 'utf8')
  const { data, content } = matter(fileContents)

  data['content'] = content

  // modify obj
  if (typeof data['excerpt'] === 'undefined') {
    data['excerpt'] = getMDExcerpt(content, 500);
  }
  if (typeof data['title'] === 'undefined') {
    data['title'] = decodeURI(path.basename(pathToObj, '.md'))
  }
  if (typeof data['date'] === 'object') {
    data['date'] = data['date']?.toISOString()
  } else if (typeof data['date'] !== 'undefined') {
    data['date'] = data['date'].toString()
  }

  data['tags'] = Array.from(content.matchAll(TAG_IN_CONTENT_REGEX), m => m[1]);

  return data
}

export function getAllPosts(fields: string[] = []) {
  let files = getFilesRecursively(mdDir, /\.md(?:#[^\)]*)?/);
  let posts = files
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}

export function getLinksMapping() {
  const linksMapping = new Map<string, string[]>();
  const postsMapping = new Map((getAllPosts(['slug', 'content'])).map(i => [i.slug, i.content]));
  const allSlugs = new Set(postsMapping.keys());
  postsMapping.forEach((content: string, slug) => {
    const mdLink = /\[[^\[\]]+\]\(([^\(\)]+)\)/g
    const matches = Array.from(content.matchAll(mdLink))
    const linkSlugs: string[] = []
    for (var m of matches) {
      const linkSlug = getSlugFromHref(slug, m[1])
      if (allSlugs.has(linkSlug)) {
        linkSlugs.push(linkSlug);
      }
    }
    linksMapping[slug] = linkSlugs
  });
  return linksMapping;
}

export function getSlugFromHref (currSlug: string, href: string) {
  return decodeURI(path.join(...currSlug.split(path.sep).slice(0, -1), href)).replace(/\.md(?:#[^\)]*)?$/, '')
}

export function updateMarkdownLinks(markdown: string, currSlug: string) {
  // remove `.md` from links
  markdown = markdown.replaceAll(/(\[[^\[\]]+\]\([^\(\)]+)(\.md(?:#[^\)]*)?)(\))/g, "$1$3");

  // update image links
  markdown = markdown.replaceAll(/(\[[^\[\]]*\]\()([^\(\)]+)(\))/g, (m, m1, m2: string, m3) => {
    const slugDir = path.join(...currSlug.split(path.sep).slice(0, -1))
    let relLink = m2;
    if (!m2.startsWith(slugDir)) {
      relLink = path.join(slugDir, m2)
    }
    const relAssetDir = path.relative('./public', process.env.MD_ASSET_DIR || '')
    const fileSlugRel = decodeURI(path.join(mdDir, relLink))
    const fileSlugAbs = decodeURI(path.join(mdDir, m2))
    if (fs.existsSync(fileSlugRel)) {
      const imgPath = path.join(relAssetDir, relLink);
      return `${m1}/${imgPath}${m3}`
    } else if (fs.existsSync(fileSlugAbs)) {
      const imgPath = path.join(relAssetDir, m2);
      return `${m1}/${imgPath}${m3}`
    }
    return m;
  });
  return markdown
}

export function getAllTags() {
  const posts = getAllPosts(['tags']);

  const allTags: string[] = [];

  posts.forEach((post) => {
    const tags = post.tags as string[];
    tags.forEach(tag => allTags.includes(tag) || allTags.push(tag));
  });
  allTags.sort();

  return allTags;
};

export function getTagNodes(tags: string[]) {
  const root: TagNode = {
    label: '',
    fullPath: '',
    children: [],
  };

  const tagMap: Record<string, TagNode> = {};

  tags.forEach(tag => {
    const parts = tag.split('/');
    let currentNode = root;
    let currentPath = '';

    for (const part of parts) {
      const fullPath = currentPath ? `${currentPath}/${part}` : part;
      if (!tagMap[fullPath]) {
        const child = { label: part, fullPath, children: [] };
        currentNode.children.push(child);
        tagMap[fullPath] = child;
      }
      currentNode = tagMap[fullPath];
      currentPath = fullPath;
    }
  });

  const compareFn = (node1: TagNode, node2: TagNode) => ((node2.children.length ? 1 : 0) - (node1.children.length ? 1 : 0));
  root.children.sort(compareFn);
  Object.keys(tagMap).forEach(key => {
    tagMap[key].children.sort(compareFn);
  });

  return root;
}
