---
title: 'Day 1 - AI랑 친해지기 프로젝트를 시작하며, 블로그부터 만들었다'
description: '매일 AI를 직접 써 보고 기록하기로 했다. 첫날은 Astro와 GitHub Pages로 블로그를 만들고, 만드는 과정을 순서대로 적어 뒀다.'
pubDate: 'Oct 08 2026'
category: '개발'
---

## 왜 시작했나

AI와 친해지고 싶었다. 개발, 디자인, 마케팅, 데이터 분석, 콘텐츠 제작까지 다양한 분야를 AI로 직접 해 보고, 새로 나온 AI와 개념(RAG, MCP, 에이전트 등)도 꾸준히 써 볼 계획이다. 배운 건 이 블로그와 카드뉴스로 나눌 생각이다.

## Day 1: 블로그 만들기

첫날 과제는 블로그를 만드는 것이었다. 도구는 Astro로 골랐다. 마크다운 파일만 넣으면 글이 되고, 만들어진 사이트가 정적 HTML이라 빠르고 검색에도 유리하다고 해서다. 배포는 GitHub Pages로 했다. 코드와 글이 GitHub 한곳에 모이기 때문이다.

Astro 공식 블로그 템플릿으로 시작해서 주소와 제목을 바꾸고, 푸시하면 자동으로 배포되도록 GitHub Actions를 붙였다. 그다음 한글 폰트, 다크모드, 댓글, 카테고리, 검색 등록까지 차례로 해 봤다.

해 보면서 알게 된 건, 저장소 이름을 `계정이름.github.io`로 만들면 따로 설정하지 않아도 주소가 `https://계정이름.github.io`가 된다는 점이다. 그리고 템플릿에 들어 있는 샘플 글(Lorem ipsum)은 공개하기 전에 꼭 지워야 한다.

## 따라 만들기

비슷하게 블로그를 만들어 보고 싶은 사람이 있을 수도 있어서, 오늘 한 과정을 순서대로 적어 둔다. 호스팅은 GitHub Pages라서 비용은 들지 않는다.

준비물은 GitHub 계정, [Node.js](https://nodejs.org)(LTS 버전), [Git](https://git-scm.com), 그리고 AI 코딩 도구(Claude Code 등)다. 터미널에서 저장소를 만들고 올리는 데 [GitHub CLI](https://cli.github.com)도 썼는데, 없어도 된다.

코딩을 잘 몰라도 괜찮다. 뒤쪽의 기능 추가(6번부터)는 Claude Code 같은 AI 코딩 도구에 프롬프트를 그대로 붙여 넣으면 만들어 준다. 1~5번도 명령어가 낯설다면 아래 프롬프트로 대신할 수 있다.

```text
Astro 블로그 템플릿으로 '계정이름.github.io' 폴더에 블로그를 만들어 줘.
- 사이트 주소는 https://계정이름.github.io 로 설정해 줘.
- 템플릿에 들어 있는 샘플 글과 샘플 문구는 지워 줘.
- main 브랜치에 푸시하면 GitHub Pages로 자동 배포되도록 GitHub Actions 워크플로를 만들어 줘.
- GitHub에 '계정이름.github.io' 이름의 공개 저장소를 만들고 올려 줘.
```

다만 아래 5번(Pages 소스 설정)은 브라우저에서 직접 눌러야 한다. 각 단계가 무슨 일을 하는지 알고 싶다면 아래 설명을 읽어 보면 된다.

### 1. 프로젝트 만들기

블로그 템플릿으로 시작한다. 폴더 이름은 `계정이름.github.io`로 짓는다. 이 이름이어야 주소가 `https://계정이름.github.io`가 된다.

```bash
npm create astro@latest 계정이름.github.io -- --template blog
cd 계정이름.github.io
npm run dev
```

`npm run dev`를 실행하면 브라우저에서 바로 미리 볼 수 있다.

### 2. 사이트 주소와 제목 바꾸기

`astro.config.mjs`의 `site`를 내 주소로 바꾼다.

```js
export default defineConfig({
  site: 'https://계정이름.github.io',
  // ...
});
```

블로그 제목과 설명은 `src/consts.ts`에서 바꾼다. `src/content/blog/`에 있는 샘플 글과 샘플 문구는 공개하기 전에 지운다.

### 3. 자동 배포 설정

푸시하면 알아서 배포되도록 `.github/workflows/deploy.yml` 파일을 만든다. [Astro 공식 문서](https://docs.astro.build/en/guides/deploy/github/)에 나온 내용을 그대로 따랐다.

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

액션 버전은 자주 바뀌니, 위 공식 문서에서 최신 버전을 한 번 확인하는 게 좋다.

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

저장소의 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 바꾼다. 이걸 빼먹으면 푸시해도 사이트가 뜨지 않는다. 바꾼 뒤 Actions 탭에서 배포가 끝나기를 기다렸다가 `https://계정이름.github.io`에 접속해 본다.

### 6. 한글 폰트 바꾸기

템플릿 기본 폰트에는 한글이 없어서 한글이 기본 고딕으로 나온다. 한글이 예쁜 [Pretendard](https://github.com/orioncactus/pretendard)로 바꿔 보자. AI 코딩 도구에 이렇게 입력하면 된다.

```text
이 블로그의 글꼴을 Pretendard로 바꿔 줘.
- CDN으로 불러오는 방식으로 하고 모든 페이지에 적용해 줘.
- 한글 글이 단어 단위로 줄바꿈되게 해 줘.
```

### 7. 라이트/다크 모드 전환

방문자가 밝은 화면과 어두운 화면 중에 고를 수 있게 만든다. 이렇게 입력하면 된다.

```text
블로그에 라이트/다크 모드 전환 기능을 만들어 줘.
- 헤더에 해/달 아이콘 토글 버튼을 넣어 줘.
- 처음 방문하면 기기의 라이트/다크 설정을 따르고, 버튼을 누르면 반대 모드로 바뀌게 해 줘.
- 사용자가 고른 모드는 저장해서 다음에 와도 유지되게 해 줘.
- 페이지가 열릴 때 화면이 번쩍이지 않게 해 줘.
- 색은 CSS 변수로 정리하고, 다크 모드에서는 눈이 편한 색으로 바꿔 줘.
```

만들어진 걸 보고 "다크 모드에서 글자가 잘 안 보여", "버튼이 너무 커" 같이 말로 고쳐 달라고 하면 된다.

### 8. 카테고리 나누기

매일 하는 분야가 달라서, 관심 있는 분야만 골라 볼 수 있도록 카테고리를 만들었다. 카테고리 이름은 본인 블로그에 맞게 바꿔서 입력하면 된다.

```text
글에 카테고리를 붙일 수 있게 해 줘.
- 카테고리는 '개발', '디자인·콘텐츠', '데이터 분석', 'AI 개념'으로 하고, 글 맨 위 설정에 category 한 줄로 지정하게 해 줘.
- 목록에 없는 이름을 쓰면 빌드할 때 오류가 나게 해 줘.
- 블로그 목록 위에 카테고리 필터 버튼을 만들고, 누르면 그 카테고리 글만 모아 보여 주는 페이지가 생기게 해 줘.
- 글이 하나도 없는 카테고리는 버튼에 보이지 않게 해 줘.
- 글 카드와 글 상세 페이지에 카테고리 배지를 보여 줘.
```

내가 만든 전체 코드는 [내 저장소](https://github.com/mungonkim/mungonkim.github.io)에 올려 뒀다. 직접 코드를 보고 싶다면 참고하면 된다.

### 9. 댓글 달기 (giscus)

[giscus](https://giscus.app/ko)는 GitHub Discussions를 댓글창으로 쓰는 무료 서비스다. 광고가 없고, 댓글이 내 저장소에 쌓인다. 먼저 브라우저에서 직접 해야 하는 단계가 있다.

1. 저장소 Settings → General → Features에서 **Discussions**를 켠다.
2. [giscus 앱](https://github.com/apps/giscus)을 내 블로그 저장소에만 설치한다.
3. [giscus.app](https://giscus.app/ko)에서 저장소 이름을 입력하고, 카테고리는 **Announcements**를 고른다. 글마다 토론 스레드는 관리자만 만들 수 있어서 스팸 토론이 생기지 않는다.
4. 페이지 아래쪽에 나오는 `data-repo`, `data-repo-id`, `data-category`, `data-category-id` 값을 복사해 둔다.

그다음 복사한 값을 넣어서 AI 코딩 도구에 입력한다.

```text
블로그 글 페이지 맨 아래에 giscus 댓글창을 붙여 줘.
- 설정 값은 아래를 써 줘.
  data-repo: (복사한 값)
  data-repo-id: (복사한 값)
  data-category: Announcements
  data-category-id: (복사한 값)
- 블로그 글에만 보이게 하고, About 같은 고정 페이지에는 안 보이게 해 줘.
- 라이트/다크 모드를 바꾸면 댓글창 색도 같이 바뀌게 해 줘.
- 언어는 한국어로 해 줘.
```

참고로 댓글은 GitHub 계정이 있어야 달 수 있다. 계정이 없으면 읽기만 된다.

### 10. 구글 검색에 등록하기

`github.io` 주소도 구글에 검색될 수 있다. 다만 저절로 되지는 않고 등록을 해 줘야 한다. Astro 블로그 템플릿에는 사이트맵(`sitemap-index.xml`)이 이미 들어 있다.

1. [Google Search Console](https://search.google.com/search-console)에서 속성 유형을 **URL 접두어**로 하고 내 주소를 입력한다.
2. 소유권 확인 방법으로 **HTML 태그**를 고르면 `<meta name="google-site-verification" content="...">` 모양의 코드가 나온다. 이 코드를 복사한다.
3. AI 코딩 도구에 입력하고 배포한다.

```text
구글 Search Console 소유권 확인용 메타 태그를 모든 페이지의 head에 넣어 줘.
태그는 이거야: (복사한 코드 전체)
```

4. 배포가 끝나면 Search Console에서 확인 버튼을 누른다.
5. 왼쪽 메뉴의 **Sitemaps**에 `sitemap-index.xml`을 제출한다.

제출 직후에는 "가져올 수 없음"이라고 뜰 수 있다. 방금 제출해서 그런 것이니 몇 시간 뒤에 다시 확인하면 된다.

### 프롬프트를 쓸 때 팁

- 한 번에 하나씩 시키는 게 좋다. 여러 기능을 한꺼번에 요청하면 어디서 문제가 생겼는지 찾기 어렵다.
- 요청한 뒤에는 "빌드가 되는지 확인해 줘"라고 덧붙이면 오류를 바로 잡아 준다.
- 결과가 마음에 들지 않으면 처음부터 다시 쓰지 말고 "여기가 이상해, 이렇게 바꿔 줘"라고 이어서 말하면 된다.
- 계정 이름이나 코드처럼 괄호로 표시한 부분은 본인 값으로 바꿔서 입력한다.
### 내가 막혔던 곳

- **푸시가 거부됐다.** `refusing to allow an OAuth App to create or update workflow ... without workflow scope`라는 오류가 났다. GitHub CLI 로그인 권한에 `workflow`가 없어서였고, `gh auth refresh -h github.com -s workflow`로 권한을 추가하니 해결됐다.
- **Pages 소스가 엉뚱하게 되어 있었다.** 처음에는 `Deploy from a branch`로 되어 있었다. 5번처럼 `GitHub Actions`로 바꿔야 한다.
- **바꾼 게 안 보일 때가 있었다.** GitHub Pages는 페이지를 10분 정도 캐시해서, 배포가 끝나도 예전 화면이 보이기도 한다. Ctrl+Shift+R로 새로고침하면 대부분 해결된다.

만들다가 궁금한 점은 댓글로 남겨주세요.

## 앞으로

다음에는 AI 뉴스를 쉬운 카드뉴스로 만들어 주는 시스템을 만들어 볼 예정이다. 그 과정도 이 블로그에 기록할 것이다.
