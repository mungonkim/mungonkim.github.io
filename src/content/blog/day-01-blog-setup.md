---
title: 'Day 1 - AI랑 친해지기 프로젝트를 시작하며, 블로그부터 만들었어요'
description: '매일 AI를 직접 써 보고 기록하기로 했어요. 첫날은 Astro와 GitHub Pages로 블로그를 만들고, 만드는 과정을 순서대로 적어 뒀어요.'
pubDate: 'Oct 08 2026'
category: '개발'
---

## 왜 시작했냐면

AI랑 좀 친해져 보고 싶었어요. 개발, 디자인, 마케팅, 데이터 분석, 콘텐츠 만들기까지 가리지 않고 AI로 직접 해 보고, 새로 나온 AI나 개념(RAG, MCP, 에이전트 같은 것들)도 꾸준히 써 보려고 해요. 배운 건 이 블로그와 카드뉴스로 나눠 볼 생각이에요.

## Day 1: 블로그 만들기

첫날 과제는 블로그를 만드는 거였어요. 도구는 Astro로 골랐어요. 마크다운 파일만 넣으면 글이 되고, 만들어진 사이트가 정적 HTML이라 빠르고 검색에도 유리하다고 해서요. 배포는 GitHub Pages로 했어요. 코드와 글이 GitHub 한곳에 모이니까요.

Astro 공식 블로그 템플릿으로 시작해서 주소와 제목을 바꾸고, 푸시하면 자동으로 배포되게 GitHub Actions를 붙였어요. 그다음에 한글 폰트, 다크모드, 댓글, 카테고리, 검색 등록까지 차례로 해 봤어요.

해 보면서 알게 된 건, 저장소 이름을 `계정이름.github.io`로 만들면 따로 설정하지 않아도 주소가 `https://계정이름.github.io`가 된다는 거예요. 그리고 템플릿에 들어 있는 샘플 글(Lorem ipsum)은 공개하기 전에 꼭 지워야 하고요.

## 따라 만들기

비슷하게 블로그를 만들어 보고 싶은 분이 있을 수도 있을 것 같아서, 오늘 한 과정을 순서대로 적어 둘게요. 호스팅은 GitHub Pages라서 돈은 들지 않아요.

준비물은 GitHub 계정, [Node.js](https://nodejs.org)(LTS 버전), [Git](https://git-scm.com)이에요. 터미널에서 저장소를 만들고 올리는 게 편해서 [GitHub CLI](https://cli.github.com)도 썼는데, 없어도 괜찮아요.

### 1. 프로젝트 만들기

블로그 템플릿으로 시작해요. 폴더 이름은 `계정이름.github.io`로 지어 주세요. 이 이름이어야 주소가 `https://계정이름.github.io`가 돼요.

```bash
npm create astro@latest 계정이름.github.io -- --template blog
cd 계정이름.github.io
npm run dev
```

`npm run dev`를 실행하면 브라우저에서 바로 미리 볼 수 있어요.

### 2. 사이트 주소와 제목 바꾸기

`astro.config.mjs`의 `site`를 내 주소로 바꿔요.

```js
export default defineConfig({
  site: 'https://계정이름.github.io',
  // ...
});
```

블로그 제목과 설명은 `src/consts.ts`에서 바꾸면 돼요. `src/content/blog/`에 있는 샘플 글과 샘플 문구는 공개하기 전에 지워 주세요.

### 3. 자동 배포 설정

푸시하면 알아서 배포되도록 `.github/workflows/deploy.yml` 파일을 만들어요. [Astro 공식 문서](https://docs.astro.build/en/guides/deploy/github/)에 나온 내용을 그대로 따랐어요.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

액션 버전은 자주 바뀌니까, 위 공식 문서에서 최신 버전을 한 번 확인해 보세요.

### 4. GitHub에 올리기

저장소 이름은 꼭 `계정이름.github.io`로 만들어야 해요.

```bash
git init -b main
git add -A
git commit -m "블로그 초기 구축"
gh repo create 계정이름.github.io --public --source . --push
```

GitHub CLI가 없으면 웹에서 저장소를 만든 다음 `git remote add origin ...`, `git push -u origin main`으로 올리면 돼요.

### 5. GitHub Pages 켜기

저장소의 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 바꿔 주세요. 이걸 빼먹으면 푸시해도 사이트가 뜨지 않아요. 바꾸고 나면 Actions 탭에서 배포가 끝나길 기다렸다가 `https://계정이름.github.io`에 들어가 보면 돼요.

### 6. 한글 폰트 바꾸기

템플릿 기본 폰트에는 한글이 없어서 한글이 기본 고딕으로 나와요. [Pretendard](https://github.com/orioncactus/pretendard)를 불러오면 훨씬 보기 좋아요. `src/components/BaseHead.astro`의 `<head>` 안에 아래를 넣고, CSS의 `font-family` 맨 앞에 `'Pretendard Variable'`을 적어 주세요.

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
/>
```

### 7. 라이트/다크 모드 전환

색을 CSS 변수로 빼 두고, 기기가 다크 모드이거나 사용자가 다크를 직접 골랐을 때만 값을 바꾸는 방식이에요. 처음 방문하면 기기 설정을 따르고, 한 번 고르면 그 선택을 기억해요.

```css
:root {
  --bg: #fafaf9;
  --text: #1c1917;
}
/* 기기가 다크이고, 사용자가 라이트를 직접 고르지 않았을 때 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg: #0c0a09;
    --text: #f5f5f4;
  }
}
/* 사용자가 다크를 직접 골랐을 때 */
:root[data-theme='dark'] {
  --bg: #0c0a09;
  --text: #f5f5f4;
}
body {
  background: var(--bg);
  color: var(--text);
}
```

화면이 그려지기 전에 저장된 선택을 먼저 적용해야 다크를 골랐는데도 흰 화면이 잠깐 번쩍이는 일이 없어요. `<head>`에 이 스크립트를 넣어요. Astro에서는 `is:inline`을 붙여야 그대로 들어가요.

```html
<script is:inline>
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (e) {}
</script>
```

헤더에는 버튼 하나를 두고, 누르면 지금과 반대 모드로 바꾸면서 선택을 저장해요.

```html
<button id="theme-toggle" type="button" aria-label="라이트/다크 모드 전환">🌓</button>

<script>
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const root = document.documentElement;
    const current =
      root.getAttribute('data-theme') ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
</script>
```

### 8. 카테고리 나누기

매일 하는 분야가 달라서, 보는 사람이 관심 있는 분야만 골라 볼 수 있게 카테고리를 만들었어요. 카테고리 이름을 한곳(`src/consts.ts`)에 모아 두고, 글 설정 스키마(`src/content.config.ts`)에서 그 목록 안의 값만 쓰도록 막았어요. 오타가 나면 빌드 단계에서 바로 알려 줘요.

```ts
// src/consts.ts
export const CATEGORY_NAMES = ['개발', '디자인·콘텐츠', '데이터 분석', 'AI 개념'] as const;

// src/content.config.ts
schema: z.object({
  title: z.string(),
  // ...
  category: z.enum(CATEGORY_NAMES).optional(),
}),
```

글을 쓸 때는 맨 위 설정에 한 줄만 추가하면 돼요.

```md
---
title: '글 제목'
category: '개발'
---
```

카테고리별 페이지는 글을 `getCollection('blog')`로 모아서 `getStaticPaths`로 만들었어요. 글이 있는 카테고리만 페이지가 생기게 했어요.

```astro
---
// src/pages/category/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  // 글이 1개 이상 있는 카테고리만 골라서 페이지를 만든다
  // ...
}
---
```

블로그 목록 위의 필터 버튼과 배지까지 포함한 전체 코드는 [제 저장소](https://github.com/mungonkim/mungonkim.github.io)에 그대로 올려 뒀어요. 필요하면 가져다 쓰세요.

### 9. 댓글 달기 (giscus)

[giscus](https://giscus.app/ko)는 GitHub Discussions를 댓글창으로 쓰는 무료 서비스예요. 광고가 없고, 댓글이 내 저장소에 쌓여요. 순서는 이래요.

1. 저장소 Settings → General → Features에서 **Discussions**를 켜요.
2. [giscus 앱](https://github.com/apps/giscus)을 내 블로그 저장소에만 설치해요.
3. [giscus.app](https://giscus.app/ko)에서 저장소 이름을 입력하고, 카테고리는 **Announcements**를 골라요. 글마다 토론 스레드는 저만 만들 수 있어서 스팸 토론이 생기지 않아요.
4. 아래쪽에 나오는 설정 값을 글 페이지 맨 아래 컴포넌트에 넣어요.

```html
<script
  src="https://giscus.app/client.js"
  data-repo="계정이름/계정이름.github.io"
  data-repo-id="(giscus.app에서 나온 값)"
  data-category="Announcements"
  data-category-id="(giscus.app에서 나온 값)"
  data-mapping="pathname"
  data-theme="preferred_color_scheme"
  data-lang="ko"
  crossorigin="anonymous"
  async
></script>
```

참고로 댓글은 GitHub 계정이 있어야 달 수 있어요. 계정이 없으면 읽기만 돼요.

### 10. 구글 검색에 등록하기

`github.io` 주소도 구글에 검색될 수 있는데, 저절로 되지는 않고 등록을 해 줘야 해요. Astro 블로그 템플릿에는 사이트맵(`sitemap-index.xml`)이 이미 들어 있어요.

1. [Google Search Console](https://search.google.com/search-console)에서 속성 유형을 **URL 접두어**로 하고 내 주소를 입력해요.
2. 소유권 확인 방법으로 **HTML 태그**를 골라요. 나온 `<meta name="google-site-verification" ...>` 태그를 모든 페이지의 `<head>`에 넣고 배포해요.
3. 배포가 끝나면 Search Console에서 확인 버튼을 눌러요.
4. 왼쪽 메뉴의 **Sitemaps**에 `sitemap-index.xml`을 제출해요.

제출하고 나면 처음에는 "가져올 수 없음"이라고 뜰 수 있어요. 방금 제출해서 그런 거라, 몇 시간 뒤에 다시 보면 돼요.

### 제가 막혔던 곳

- **푸시가 거부됐어요.** `refusing to allow an OAuth App to create or update workflow ... without workflow scope`라는 오류가 났어요. GitHub CLI 로그인 권한에 `workflow`가 없어서였고, `gh auth refresh -h github.com -s workflow`로 권한을 추가하니 해결됐어요.
- **Pages 소스가 엉뚱하게 되어 있었어요.** 처음에는 `Deploy from a branch`로 되어 있었어요. 5번처럼 `GitHub Actions`로 바꿔야 해요.
- **바꾼 게 안 보일 때가 있었어요.** GitHub Pages는 페이지를 10분 정도 캐시해서, 배포가 끝나도 예전 화면이 보이기도 해요. Ctrl+Shift+R로 새로고침하면 대부분 해결돼요.

만들다가 궁금한 점이 생기면 아래 댓글로 남겨 주세요.

## 앞으로

다음에는 AI 뉴스를 쉬운 카드뉴스로 만들어 주는 시스템에 도전해 보려고 해요. 만드는 과정도 여기에 기록할 거예요.
