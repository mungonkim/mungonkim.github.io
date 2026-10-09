// 프로젝트 목록. 새 프로젝트를 시작하면 여기에 추가하고, 글 머리말에 project: '슬러그'를 적는다.
// 상태가 바뀌면 status만 고치면 홈 · About · 프로젝트 페이지에 모두 반영된다.
export const PROJECT_SLUGS = ['blog', 'news-cardnews'] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];
export type ProjectStatus = '진행 중' | '운영 중' | '완료';

export type Project = {
	slug: ProjectSlug;
	// 프로젝트 번호 (제목의 "프로젝트 N"과 맞춘다)
	number: number;
	name: string;
	desc: string;
	status: ProjectStatus;
};

export const PROJECTS: Project[] = [
	{
		slug: 'blog',
		number: 1,
		name: 'AI랑 친해지기 블로그',
		desc: 'Astro와 GitHub Pages로 직접 만든 회고 · 기술 블로그. 푸시하면 자동 배포되고, 댓글과 다크모드, 카테고리를 갖췄습니다.',
		status: '운영 중',
	},
	{
		slug: 'news-cardnews',
		number: 2,
		name: 'AI 뉴스 카드뉴스 시스템',
		desc: '매일 최신 AI 기사 하나를 골라 입문자용 카드뉴스로 만들어 슬랙으로 알려 주는 시스템. 클라우드에서 자동으로 실행되고, 업로드는 직접 합니다.',
		status: '운영 중',
	},
];

export const getProject = (slug: ProjectSlug): Project => {
	const project = PROJECTS.find((item) => item.slug === slug);
	if (!project) throw new Error(`알 수 없는 프로젝트입니다: ${slug}`);
	return project;
};
