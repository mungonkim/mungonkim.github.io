// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'AI랑 친해지기';
export const SITE_DESCRIPTION = '매일 AI를 직접 써보고 배운 것을 기록하는 회고 · 기술 블로그';

// 글 머리말(frontmatter)의 category에 쓰는 값. 글의 성격으로 나눈다 (2026-10-28 개편).
// - 공부 기록: 로드맵을 따라 배우고 문제를 푼 글
// - 만들기 기록: 블로그 · 카드뉴스 · 공감툰처럼 직접 만들고 운영한 글
// - AI 개념: 개념 하나를 쉽게 풀어 쓴 글
// 새 카테고리는 여기와 아래 슬러그 표에 함께 추가한다.
export const CATEGORY_NAMES = ['공부 기록', '만들기 기록', 'AI 개념'] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

// URL에 쓰는 영문 슬러그 (/category/study/ 형태)
export const CATEGORY_SLUGS: Record<CategoryName, string> = {
	'공부 기록': 'study',
	'만들기 기록': 'build',
	'AI 개념': 'concept',
};
