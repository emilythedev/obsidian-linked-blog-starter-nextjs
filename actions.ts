'use server';

import { Searcher } from 'fast-fuzzy';
import Author from './interfaces/author';
import { getAllPosts } from './lib/api';
import { getMDExcerpt } from './lib/markdownToHtml';

export type SearchResult = {
  slug: string,
  title: string,
  excerpt: string,
  date: string,
  author: Author,
};

const allPosts = getAllPosts([
  "slug", "title", "content", "author", "date"
]);

const searchIndex = allPosts.map((p) => {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: getMDExcerpt(p.content),
    date: p.date,
    author: p.author,
  } as SearchResult;
});
const searcher = new Searcher(searchIndex, {
  keySelector: (obj) => `${obj.title}\n${obj.excerpt}`
});

export const searchPosts = async (searchText: string, limit: number = 10) => {
  const searchedPosts = searcher.search(searchText);
  return searchedPosts.slice(0, limit);
};
