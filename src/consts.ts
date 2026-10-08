// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'AI랑 친해지기';
export const SITE_DESCRIPTION = '매일 AI를 직접 써보고 배운 것을 기록하는 회고 · 기술 블로그';

// 글 머리말(frontmatter)의 category에 쓰는 값. 새 카테고리는 여기와 아래 슬러그 표에 함께 추가한다.
export const CATEGORY_NAMES = [
	'개발',
	'디자인·콘텐츠',
	'마케팅·기획',
	'데이터 분석',
	'자동화·에이전트',
	'AI 개념',
	'일상·활용',
	'프로젝트 회고',
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

// URL에 쓰는 영문 슬러그 (/category/dev/ 형태)
export const CATEGORY_SLUGS: Record<CategoryName, string> = {
	개발: 'dev',
	'디자인·콘텐츠': 'design',
	'마케팅·기획': 'marketing',
	'데이터 분석': 'data',
	'자동화·에이전트': 'automation',
	'AI 개념': 'concept',
	'일상·활용': 'life',
	'프로젝트 회고': 'project',
};
