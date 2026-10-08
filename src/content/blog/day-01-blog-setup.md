---
title: 'Day 1 - AI랑 친해지기 프로젝트를 시작하며, 블로그부터 만들었다'
description: '매일 AI를 직접 써보고 기록하기로 했다. 첫날은 Astro와 GitHub Pages로 블로그를 띄웠다.'
pubDate: 'Oct 08 2026'
category: '개발'
---

## 왜 시작했나

AI와 친해지고 싶었다. 개발, 디자인, 마케팅, 데이터 분석, 콘텐츠 제작까지 다양한 분야를 AI로 직접 해보고, 새로 나온 AI와 개념을 꾸준히 써보며 배우는 게 목표다. 그리고 배운 걸 이 블로그와 카드뉴스로 나눌 계획이다.

## 앞으로의 방식

- 매일 Claude가 과제 하나를 낸다. 하루짜리 체험일 수도, 오래 끌고 가는 프로젝트일 수도 있다.
- 직접 해결하고, 그날 한 것을 이 블로그에 회고로 남긴다.
- 막힌 날도 실패한 날도 그대로 기록한다.

## Day 1: 블로그 만들기

### 한 일

- 블로그 도구로 **Astro**를 골랐다. 마크다운 파일만 넣으면 글이 되고, 정적 HTML이라 빠르고 검색 노출에도 유리하다고 해서 선택했다.
- **GitHub Pages**로 배포하기로 했다. 코드와 글이 GitHub 한곳에 모인다.
- Astro 공식 블로그 템플릿으로 시작해서 사이트 주소와 제목을 바꾸고, 푸시하면 자동 배포되는 GitHub Actions를 붙였다.

### 배운 점

- 저장소 이름을 `계정이름.github.io`로 만들면 별도의 `base` 경로 설정 없이 주소가 바로 `https://계정이름.github.io`가 된다.
- 템플릿에 들어 있는 샘플 글(Lorem ipsum)은 공개 전에 지워야 한다.

## 따라 만들기: 나처럼 블로그를 만들고 싶다면

오늘 한 과정을 그대로 정리했다. 호스팅은 GitHub Pages라서 비용이 들지 않는다.

### 준비물

- GitHub 계정
- [Node.js](https://nodejs.org) (LTS 버전)와 [Git](https://git-scm.com)
- (선택) [GitHub CLI](https://cli.github.com): 터미널에서 저장소를 만들고 올리는 데 편하다.

### 1. 프로젝트 만들기

블로그 템플릿으로 시작한다. 폴더 이름은 `계정이름.github.io`로 짓는다. 이 이름이어야 주소가 `https://계정이름.github.io`가 된다.

```bash
npm create astro@latest 계정이름.github.io -- --template blog
cd 계정이름.github.io
npm run dev
```

`npm run dev`를 실행하면 브라우저에서 바로 미리 볼 수 있다.

### 2. 사이트 주소와 제목 설정

`astro.config.mjs`의 `site`를 내 주소로 바꾼다.

```js
export default defineConfig({
  site: 'https://계정이름.github.io',
  // ...
});
```

제목과 설명은 `src/consts.ts`에서 바꾼다. 템플릿에 들어 있는 샘플 글(`src/content/blog/`)과 샘플 문구는 공개하기 전에 지운다.

### 3. 자동 배포 설정

푸시하면 자동으로 배포되도록 `.github/workflows/deploy.yml` 파일을 만든다. ([Astro 공식 문서](https://docs.astro.build/en/guides/deploy/github/)의 내용을 따랐다.)

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

액션 버전은 계속 바뀌니, 위 공식 문서에서 최신 버전을 확인하는 게 좋다.

### 4. GitHub에 올리기

저장소 이름은 반드시 `계정이름.github.io`로 만든다.

```bash
git init -b main
git add -A
git commit -m "블로그 초기 구축"
gh repo create 계정이름.github.io --public --source . --push
```

GitHub CLI가 없다면 웹에서 저장소를 만든 뒤 `git remote add origin ...`, `git push -u origin main`으로 올리면 된다.

### 5. GitHub Pages 켜기

저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꾼다. 이걸 빼먹으면 푸시해도 사이트가 뜨지 않는다. 설정하고 나면 **Actions 탭**에서 배포가 끝나기를 기다린 뒤 `https://계정이름.github.io`로 접속한다.

### 내가 막혔던 곳

- **푸시가 거부됨**: `refusing to allow an OAuth App to create or update workflow ... without workflow scope`라는 오류가 났다. GitHub CLI 로그인 권한에 `workflow`가 없어서였고, `gh auth refresh -h github.com -s workflow`로 권한을 추가하니 해결됐다.
- **Pages 소스가 엉뚱하게 설정됨**: 처음에는 Pages 소스가 `Deploy from a branch`로 되어 있었다. 5번처럼 `GitHub Actions`로 바꿔야 한다.
- **한글이 어색하게 보임**: 템플릿 기본 폰트에는 한글이 없다. [Pretendard](https://github.com/orioncactus/pretendard) 같은 한글 폰트를 따로 불러오면 훨씬 보기 좋아진다.

### 더 해보고 싶다면

- 댓글: [giscus](https://giscus.app/ko)는 GitHub Discussions를 댓글창으로 쓰는 무료 서비스다. 방문자는 GitHub 계정으로 댓글을 단다.
- 검색 노출: [Google Search Console](https://search.google.com/search-console)에 사이트를 등록하고 `sitemap-index.xml`을 제출한다. 템플릿에 사이트맵이 이미 포함되어 있다.
- 다크모드, 카테고리 같은 기능은 직접 코드를 고쳐서 넣었다. 이 과정은 따로 글로 정리할 예정이다.

### 앞으로

다음에는 AI 뉴스를 쉬운 카드뉴스로 만들어 주는 시스템을 만들어 볼 예정이다. 그 과정도 이 블로그에 기록한다.
