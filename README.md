# AI랑 친해지기

매일 AI를 직접 써 보고, 그날 배운 것과 막힌 점을 기록하는 회고 · 기술 블로그입니다.

**https://mungonkim.github.io**

개발, 디자인, 마케팅, 데이터 분석, 콘텐츠 제작 등 다양한 분야를 AI로 경험하고, 새로 나온 AI 도구와 개념(RAG, MCP, 에이전트 등)을 직접 만들어 보며 기록합니다.

## 주요 기능

- 마크다운(MDX 포함)으로 글 작성
- 카테고리별 글 모아보기 (`/category/슬러그/`)
- 라이트 / 다크 모드 전환 (기기 설정을 따르고, 직접 고른 선택은 저장)
- 댓글 ([giscus](https://giscus.app/ko), GitHub Discussions 기반, GitHub 계정 필요)
- 사이트맵과 RSS 제공
- 한글 폰트(Pretendard) 적용
- `main` 브랜치에 푸시하면 GitHub Actions로 GitHub Pages에 자동 배포

## 기술 스택

- [Astro](https://astro.build) 블로그 템플릿 기반
- GitHub Pages (호스팅), GitHub Actions (배포)
- giscus (댓글)

## 따라 만들어 보고 싶다면

이 블로그를 만든 과정을 순서대로 정리해 두었습니다. 코딩을 잘 몰라도 AI 코딩 도구에 붙여 넣을 수 있는 프롬프트와 함께 안내합니다.

- [Day 1 - AI랑 친해지기 프로젝트를 시작하며, 블로그부터 만들었다](https://mungonkim.github.io/blog/day-01-blog-setup/)

만들다가 궁금한 점은 각 글의 댓글로 남겨주세요.

## 로컬에서 실행하기

Node.js 22.12 이상이 필요합니다.

| 명령어 | 설명 |
| :-- | :-- |
| `npm install` | 의존성 설치 |
| `npm run dev` | 개발 서버 실행 (`localhost:4321`) |
| `npm run build` | 배포용 결과물을 `./dist/`에 생성 |
| `npm run preview` | 빌드 결과를 로컬에서 미리 보기 |

## 새 글 쓰기

`src/content/blog/`에 마크다운 파일을 추가하고 `main`에 푸시하면 자동으로 배포됩니다. 글 맨 위에 아래 설정을 적습니다.

```md
---
title: '글 제목'
description: '글 설명'
pubDate: 'Oct 08 2026'
category: '개발'
---
```

`category`는 `src/consts.ts`의 `CATEGORY_NAMES`에 있는 값만 쓸 수 있습니다. 목록에 없는 이름을 쓰면 빌드 단계에서 오류가 납니다. 카테고리를 추가하거나 바꾸려면 `CATEGORY_NAMES`와 `CATEGORY_SLUGS`를 함께 수정합니다.

## 폴더 구조

```text
├── .github/workflows/deploy.yml   # GitHub Pages 자동 배포
├── public/                        # 파비콘 등 정적 파일
├── src/
│   ├── components/                # 헤더, 푸터, 글 카드, 카테고리, 댓글 등
│   ├── content/blog/              # 블로그 글 (마크다운)
│   ├── layouts/BlogPost.astro     # 글 상세 레이아웃
│   ├── pages/                     # 홈, 블로그 목록, 카테고리, About, RSS
│   ├── styles/global.css          # 전역 스타일과 라이트/다크 색상
│   ├── utils/categories.ts        # 카테고리 집계 도우미
│   ├── consts.ts                  # 사이트 제목, 카테고리 이름 정의
│   └── content.config.ts          # 글 설정(스키마) 검증
├── astro.config.mjs
└── package.json
```

## 참고

이 블로그는 [Astro 블로그 템플릿](https://github.com/withastro/astro/tree/main/examples/blog)에서 시작했습니다. 템플릿의 스타일은 [Bear Blog](https://github.com/HermanMartinus/bearblog/)를 바탕으로 만들어졌고, 현재 화면 스타일은 직접 다시 작성했습니다.
