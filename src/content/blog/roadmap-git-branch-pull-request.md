---
title: '프로젝트 3 (7편) - 브랜치는 이름표였다, 그리고 첫 Pull Request'
description: '연습 저장소에서 브랜치 · 머지 · 충돌을 직접 만들어 보고, 실제 저장소에서 브랜치 → Pull Request → 머지까지 혼자 해 봤다. 다른 저장소에 커밋한 실수와, 머지 전에 브랜치를 지워 PR이 닫혀 버린 일까지 그대로 적었다.'
pubDate: 'Nov 04 2026'
category: '공부 기록'
project: 'ai-engineer-roadmap'
part: 7
---

## 이번 글에서 한 것

로드맵 1단계 3주차는 Git 협업이다. 지금까지는 `main` 하나에 바로 커밋하고 push했다. 실무에서는 **브랜치를 따로 만들어 작업하고, Pull Request(PR)로 합치는** 방식이 기본이다. 이틀 동안 이렇게 진행했다.

| 날 | 한 것 | 장소 |
|---|---|---|
| 1일차 | 브랜치, 머지, 충돌을 일부러 만들고 해결 | 연습 저장소 `git-practice` (GitHub에 안 올림) |
| 2일차 | 실제 개선을 브랜치 → PR → 머지 | [python-basics](https://github.com/mungonkim/python-basics) |

진행 방식은 [지난 글](/blog/roadmap-python-httpx-weather/)과 같다. 개념마다 읽을 자료를 보고, 명령의 결과를 **먼저 예측한 뒤** 실행하고, 마지막에 한 줄 정의를 내 말로 적었다. 연습 저장소를 만드는 데 쓴 프롬프트는 이렇다.

```text
Git 브랜치, 머지, 충돌을 직접 해 보며 배우고 싶어. 나는 Windows cmd를 써.
1. 연습용 저장소를 만드는 명령부터 알려 줘. GitHub에는 올리지 않을 거야.
2. 개념(브랜치, fast-forward와 머지 커밋, 충돌)을 하나씩 설명하고, 명령 몇 줄과 ①②③을 주고 결과를 먼저 예측하게 해 줘.
3. 마지막에 충돌 해결과 머지 취소(--abort)를 미션으로 내 줘. 결과는 git log --oneline --graph --all로 확인할게.
```

## 1일차. 브랜치는 복사본이 아니라 이름표

```text
커밋 = 그 순간 프로젝트 전체의 사진
브랜치 = 특정 커밋에 붙인 이름표
HEAD = 지금 내가 보고 있는 곳
```

`feature` 브랜치를 만들고 거기서만 `banana`를 추가한 뒤 `main`으로 돌아와 파일을 열었다.

```cmd
git switch feature
echo banana>> fruits.txt
git commit -am "add banana"
git switch main
type fruits.txt
```

```text
apple
```

바나나가 없다. 브랜치를 옮기면 폴더 안의 파일이 **그 브랜치의 사진대로** 바뀐다.

```text
* 2361a1b (feature) add banana
* da39a97 (HEAD -> main) add apple
```

처음에 내가 적은 한 줄 정의는 "브랜치는 서로 독립적으로 작업할 수 있게 **나눈 공간**"이었다. 쓰임새로는 맞지만, 실제로는 파일이 복사되지 않았다. 커밋에 이름표가 하나 더 붙었을 뿐이다. 그래서 브랜치를 많이 만들어도 가볍고 빠르다. 정의를 이렇게 고쳤다.

> 브랜치는 커밋을 가리키는 이름표이고, 새 커밋을 하면 그 이름표가 앞으로 움직인다.

## 머지: 앞으로 감기와 머지 커밋

`main`에서 `git merge feature`를 하니 `Fast-forward`가 나왔다. `main`에 새 커밋이 없어서 **이름표만 앞으로 옮겼고**, 새 커밋은 생기지 않았다.

```text
* 2361a1b (HEAD -> main, feature) add banana
* da39a97 add apple
```

이번에는 양쪽에 각각 커밋을 만들고 합쳤다. `drinks` 브랜치에서는 `drinks.txt`를 추가하고, `main`에서는 `fruits.txt`에 `cherry`를 더했다.

```text
*   a8481e1 (HEAD -> main) merge drinks
|\
| * 3a28a46 (drinks) add milk
* | 327d21e add cherry
|/
* 2361a1b (feature) add banana
```

갈라졌던 두 갈래를 잇는 **머지 커밋**이 새로 생겼다. `|\`와 `|/`가 갈라지고 합쳐지는 선이다. 서로 다른 파일을 고쳤기 때문에 자동으로 합쳐졌다.

## 충돌: Git이 사람에게 묻는 것

양쪽이 **같은 파일의 같은 부분**을 다르게 고치면 Git은 어느 쪽이 맞는지 모른다. `sweet` 브랜치에서는 `fruits.txt`를 `green apple`로, `main`에서는 `red apple`로 덮어쓰고 합쳤다.

```text
CONFLICT (content): Merge conflict in fruits.txt
Automatic merge failed; fix conflicts and then commit the result.
```

```text
<<<<<<< HEAD
red apple
=======
green apple
>>>>>>> sweet
```

윗부분이 지금 내 브랜치(`main`), 아랫부분이 가져오려는 브랜치(`sweet`)다. 이건 예측이 맞았다. 해결은 세 단계다.

1. 파일을 열어 표시 세 줄을 지우고 남길 내용만 남긴다. VS Code에서 열면 충돌 부분 위에 **Accept Both Changes** 같은 버튼이 나와서, 그걸로 두 줄을 모두 남겼다.
2. `git add fruits.txt`로 해결했다고 알린다.
3. `git commit -m "merge sweet"`로 머지를 마친다.

충돌을 하나 더 만들고, 이번에는 `git merge --abort`로 **머지 전으로** 되돌리는 것도 해 봤다. 충돌 표시도, 반쯤 합쳐진 상태도 남지 않는다. 충돌이 너무 복잡하거나 잘못 머지했을 때 쓰는 비상 탈출구다.

### 실수: 다른 저장소에 커밋했다

두 번째 미션을 할 때 결과가 이상했다.

```text
C:\Users\kmk14\AI_Study\python-basics>git merge --abort
fatal: There is no merge to abort (MERGE_HEAD missing).
```

프롬프트를 보니 `git-practice`가 아니라 **진짜 저장소 `python-basics`**에 있었다. 연습용 `sour` 브랜치와 `add fresh apple` 커밋이 거기에 생겼다. 다행히 push 전이었고, 바뀐 건 사과 파일 하나뿐이라 이렇게 되돌렸다.

```cmd
git reset --hard origin/main
git branch -D sour
```

- `git reset --hard origin/main`: `main` 이름표를 GitHub에 올라간 마지막 커밋으로 되돌린다. **커밋하지 않은 변경까지 지우는** 강한 명령이라, 다른 변경이 없는 걸 확인한 뒤에만 썼다.
- `git branch -D sour`: 합쳐지지 않은 브랜치는 `-d`로 안 지워져서 강제(`-D`)로 지웠다.

**Git 명령은 지금 있는 폴더의 저장소에 적용된다.** 이후로는 명령 전에 cmd에서 `cd`(현재 경로 출력)와 `git status`부터 본다.

## 2일차. 원격 브랜치와 Pull Request

```text
내 컴퓨터                               GitHub (origin)
  main ─────────── push ───────────→   main
  origin/main ←── fetch / pull ──────   (GitHub의 main을 마지막으로 본 기록)
```

- `origin`: GitHub 저장소의 별명
- `origin/main`: GitHub의 `main`이 마지막으로 어디 있었는지 적어 둔 이름표(원격 추적 브랜치). 내가 직접 옮길 수 없다.
- 내가 만든 브랜치는 **push하기 전까지 GitHub에 없다.**

고칠 거리는 지난 글에서 남겨 둔 두 가지였다. `main` 함수에서 범위 검사를 한 번 더 하던 것과 변수 이름 오타(`status_coude`)다.

```cmd
git switch -c fix/weather-main
(코드 고치기, 테스트 71 passed · mypy Success 확인)
git commit -am "weather: main의 중복 범위 검사 제거, status_code 오타 수정"
git push -u origin fix/weather-main
```

push하니 GitHub가 이렇게 안내했다.

```text
remote: Create a pull request for 'fix/weather-main' on GitHub by visiting:
remote:      https://github.com/mungonkim/python-basics/pull/new/fix/weather-main
```

`-u`는 "이 브랜치는 앞으로 GitHub의 같은 이름 브랜치와 짝"이라고 기억시킨다. 한 번 해 두면 다음부터는 `git push`만 치면 된다. push한 뒤에도 GitHub의 `main`은 그대로다. 올라간 건 `fix/weather-main` 이름표뿐이다.

### PR 화면

안내된 주소를 열고 제목과 설명을 적었다. 설명에는 무엇을, 왜 바꿨는지와 무엇으로 확인했는지를 썼다.

```text
- main에서 build_params를 따로 부르던 검사를 지우고, fetch_current가 내보내는 ValueError를 잡도록 바꿈 (같은 검사가 두 번 돌던 문제)
- status_coude → status_code
- 확인: pytest 71 passed, mypy --strict Success, 999 입력 시 종료 코드 2
```

**Files changed** 탭에는 `6 additions and 8 deletions`가 보였다. 오타 2줄이 바뀌고, 중복 검사 6줄이 지워지고, 예외 처리 4줄이 더해졌다. 고친 의도가 이 화면에 그대로 보인다. 혼자 하는 작업이어도 PR을 쓰면 합치기 전에 내 변경을 한 화면에서 다시 보게 되고, "왜 바꿨는지"가 기록으로 남는다.

처음에는 제목과 설명만 적고 멈췄다. 그 화면은 PR을 **만들기 직전** 화면이고, 아래의 **Create pull request** 버튼을 눌러야 `pull/1`처럼 번호가 붙은 PR이 생긴다.

### 실수: 머지 전에 정리부터 했더니 PR이 닫혔다

머지한 뒤 할 일까지 한 번에 받아서, 순서를 거꾸로 했다. GitHub에서 Merge를 누르기 **전에** cmd에서 정리 명령을 먼저 실행했다.

```text
git pull
Already up to date.

git branch -d fix/weather-main
warning: deleting branch 'fix/weather-main' that has been merged to
         'refs/remotes/origin/fix/weather-main', but not yet merged to HEAD
```

`git pull`이 받아 올 게 없었던 건 GitHub의 `main`이 아직 그대로였기 때문이다. `-d`의 경고도 "GitHub에 올라가 있긴 한데 **지금 `main`에는 아직 합쳐지지 않은** 브랜치를 지운다"는 뜻이었다.

그리고 GitHub에서 작업 브랜치가 지워졌다. PR 상태를 확인해 보니 **Closed**였고, 이벤트 기록에서 PR이 닫힌 시각과 브랜치가 지워진 시각이 같은 초였다.

```text
closed            2026-11-04T13:33:41Z
head_ref_deleted  2026-11-04T13:33:41Z
```

**열려 있는 PR의 브랜치를 지우면 GitHub가 그 PR을 자동으로 닫는다.** 합칠 브랜치가 없어졌기 때문이다. 고친 커밋은 PR 안에 남아 있어서, PR 화면에서 이렇게 되살렸다.

1. **Restore branch**: 지운 브랜치 되살리기
2. **Reopen pull request**: PR 다시 열기
3. **Merge pull request** → **Confirm merge** (방식은 기본값인 머지 커밋)
4. **Delete branch**

그다음에 내 컴퓨터에서 받았다.

```text
git pull
   3b8b6bf..904aba3  main       -> origin/main
Fast-forward
 week2/weather.py | 14 ++++++--------

git log --oneline --graph -4
*   904aba3 (HEAD -> main, origin/main) Merge pull request #1 from mungonkim/fix/weather-main
|\
| * 01ecf99 weather: main의 중복 범위 검사 제거, status_code 오타 수정
|/
* 3b8b6bf 2주차 4일차: HTTP와 httpx ...
```

1일차의 `merge drinks`와 같은 모양이다. 차이는 머지 커밋을 GitHub가 만들었고, 메시지에 PR 번호가 들어갔다는 것이다. `git pull`이 Fast-forward였던 것도 1일차 개념 그대로다. 내 `main`에는 새 커밋이 없고 GitHub의 `main`이 앞서 있었다.

GitHub에서 지운 브랜치의 기록용 이름표(`origin/fix/weather-main`)는 내 컴퓨터에 남아 있어서 `git fetch --prune`으로 치웠다.

## 정리한 순서

```text
브랜치 만들기 → 고치고 테스트 → 커밋 → push -u
→ GitHub: PR 만들기 → Files changed 확인 → Merge → Delete branch
→ 내 컴퓨터: switch main → pull → (필요하면) fetch --prune
```

AI 코딩 도구에 맡길 때는 이렇게 부탁하면 같은 흐름을 따라갈 수 있다.

```text
{저장소 이름}에서 {고칠 내용}을 PR로 올리고 싶어. 나는 Windows cmd를 써.
1. 브랜치 이름을 fix/... 모양으로 정해서, 만들고 push하는 명령까지 알려 줘.
2. PR 제목과 설명(무엇을, 왜, 무엇으로 확인했는지)을 써 줘.
3. 머지는 내가 GitHub에서 직접 할게. 머지한 "뒤에" 내 컴퓨터에서 정리하는 명령은 따로 알려 줘.
```

## 확인 질문에서 배운 것

- **fast-forward와 머지 커밋**: 현재 브랜치에 새 커밋이 없으면 이름표만 앞으로 옮기고, 양쪽에 커밋이 있으면 둘을 잇는 머지 커밋이 생긴다.
- **충돌 해결**: 파일 고치기(표시 제거) → `git add` → `git commit`. 그만두려면 `git merge --abort`.
- **PR이 닫힌 이유**: 처음에는 "직접 닫았거나 브랜치 삭제 같은 작업이 영향을 줬을 수 있다"고 답했다. 원인은 기록에 하나로 남아 있었다. 열린 PR의 브랜치가 지워져서 자동으로 닫힌 것이다. 다음부터는 실제 화면과 기록에서 원인을 찾아 답하기로 했다.

## 배운 점

- **브랜치는 이름표다.** 만들어도 파일이 복사되지 않는다.
- **충돌은 오류가 아니라 질문이다.** 어느 쪽을 남길지 사람이 정한다.
- **명령 전에 어디에 있는지 본다.** Git 명령은 지금 폴더의 저장소에 적용된다.
- **push는 `main`을 바꾸지 않는다.** PR을 머지해야 바뀐다. 이게 브랜치와 PR이 `main`을 지키는 방법이다.
- **GitHub에서 머지한 다음에 내 컴퓨터를 정리한다.** 순서가 바뀌면 받아 올 게 없고, 브랜치를 먼저 지우면 PR이 닫힌다.

## 다음에

3주차 3일차는 디버깅이다. 에러 메시지를 끝까지 읽고, 문제를 다시 일으키는 절차를 만들고, 로그로 원인 범위를 좁히는 연습을 할 예정이다.

코드와 PR은 [python-basics 저장소](https://github.com/mungonkim/python-basics/pull/1)에 있다.

만들다가 궁금한 점은 댓글로 남겨주세요.
