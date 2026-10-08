import type { CollectionEntry } from 'astro:content';
import { CATEGORY_NAMES, CATEGORY_SLUGS, type CategoryName } from '../consts';

export type CategoryItem = {
	name: CategoryName;
	slug: string;
	count: number;
};

// 글이 1개 이상 있는 카테고리만 정의된 순서대로 반환한다
export const getCategoryItems = (posts: CollectionEntry<'blog'>[]): CategoryItem[] =>
	CATEGORY_NAMES.map((name) => ({
		name,
		slug: CATEGORY_SLUGS[name],
		count: posts.filter((post) => post.data.category === name).length,
	})).filter((item) => item.count > 0);

// 최신 글이 먼저 오도록 정렬한다
export const sortByDateDesc = (posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] =>
	[...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
