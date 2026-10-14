---
title: '프로젝트 3 (1편) - AI 엔지니어 로드맵 시작, 파이썬 작업 환경 만들기'
description: 'AI 엔지니어 독학 로드맵의 첫 단계로 uv, pytest, Ruff, Git으로 파이썬 연습 저장소를 만들고 GitHub에 공개했다. 명령어마다 무슨 일을 하는지와 막혔던 점을 정리했다.'
pubDate: 'Oct 14 2026'
category: '개발'
project: 'ai-engineer-roadmap'
part: 1
---

## 학습 계획을 바꿨다

지금까지는 "AI랑 친해지기"라는 이름으로 하루에 개념 하나씩 가볍게 써 보는 방식이었다. 이번에 목표를 **AI 엔지니어 취업**으로 바꾸고, 단계별로 직접 만들며 공부하는 로드맵을 따르기로 했다.

큰 순서는 이렇다.

1. Python · Git · SQL · 머신러닝 기초
2. 웹 · 백엔드 · DB · LLM API로 AI 서비스 만들기
3. RAG (문서를 찾아서 답하는 AI)
4. 에이전트와 업무 자동화
5. 평가 · 배포 · 운영
6. 캡스톤 프로젝트와 이력서
7. 이후 딥러닝, 로컬 LLM, 추론 서버와 인프라

원칙은 하나다. 단계마다 **실제로 돌아가는 결과물, 테스트, README**를 남긴다. 파이썬 기본 문법은 알고 있어서, 1단계는 문법보다 **도구와 습관**부터 잡기로 했다. 오늘은 그 0주차, 작업 환경 만들기다.

## 오늘 쓴 도구

| 도구 | 하는 일 |
|---|---|
| **uv** | 파이썬 프로젝트 만들기, 가상환경, 라이브러리 설치, 실행을 한 번에 해 주는 도구 |
| **pytest** | 함수가 맞게 동작하는지 확인하는 테스트 도구 |
| **Ruff** | 코드 스타일을 검사하고(린터) 자동으로 정리해 주는(포매터) 도구 |
| **Git · GitHub** | 코드 변경 기록을 남기고 온라인에 올리는 도구 |

**가상환경**은 프로젝트마다 따로 쓰는 파이썬 공간이다. A 프로젝트는 어떤 라이브러리의 1.x 버전이, B 프로젝트는 2.x 버전이 필요할 수 있는데, 한곳에 같이 설치하면 하나가 깨진다. 그래서 프로젝트마다 따로 둔다.

## 1. 프로젝트 만들기

VS Code 터미널에서 공부용 폴더로 가서 프로젝트를 만들었다.

```bash
uv init python-basics
code python-basics
```

- `uv init python-basics`: `python-basics` 폴더를 만들고 기본 파일을 채워 준다.
- `code python-basics`: 그 폴더를 새 VS Code 창으로 연다. VS Code는 연 폴더 하나를 한 프로젝트로 보기 때문에, 이 프로젝트만 따로 열어야 가상환경과 검사 설정이 제대로 잡힌다.

만들어진 파일은 이렇다.

| 파일 | 뜻 |
|---|---|
| `pyproject.toml` | 프로젝트 설명서. 이름, 파이썬 버전, 필요한 라이브러리가 적힌다 |
| `.python-version` | 이 프로젝트에서 쓸 파이썬 버전 |
| `.gitignore` | Git에 올리지 않을 파일 목록 |
| `README.md` | 프로젝트 소개 문서 |

## 2. 개발용 도구 설치

```bash
uv add --dev pytest ruff
```

- `uv add`: 라이브러리를 설치하고 `pyproject.toml`에 자동으로 적는다. 이때 `.venv` 폴더(가상환경)와 `uv.lock` 파일(설치된 정확한 버전 기록)이 생긴다.
- `--dev`: **개발할 때만** 필요한 도구라는 표시다. pytest와 Ruff는 프로그램을 실제로 돌릴 때는 필요 없고, 만들고 검사할 때만 쓴다. 나중에 배포할 때는 이런 도구를 빼고 설치할 수 있다.

## 3. 첫 코드와 첫 테스트

이름을 받아 인사말을 돌려주는 함수와, 그 함수를 확인하는 테스트를 직접 썼다. 빈 이름이 들어오면 "안녕!"만 돌려주기로 규칙을 정했다.

`week0/hello.py`

```python
def greet(name):
    if name:
        return f"안녕, {name}!"
    return "안녕!"


if __name__ == "__main__":
    print(greet("파이썬"))
```

`week0/test_hello.py`

```python
from hello import greet


def test1():
    assert greet("철수") == "안녕, 철수!"


def test2():
    assert greet("") == "안녕!"
```

- `if name:` 파이썬에서 빈 문자열 `""`은 거짓으로 취급된다. 그래서 `if name == "":`보다 짧게 빈 이름을 걸러낼 수 있다.
- `assert`: "이 값이 이래야 한다"는 확인이다. 틀리면 테스트가 실패한다.
- pytest는 `test_`로 시작하는 파일과 함수를 알아서 찾아 실행한다.

실행과 검사는 네 줄이다.

```bash
uv run python week0/hello.py
uv run pytest
uv run ruff check .
uv run ruff format .
```

- `uv run`: 이 프로젝트의 가상환경 안에서 명령을 실행한다. 가상환경을 켜고 끄는 과정을 신경 쓰지 않아도 된다.
- `ruff check .`: 현재 폴더(`.`) 전체의 코드 문제를 찾는다.
- `ruff format .`: 들여쓰기, 줄바꿈 같은 모양을 정해진 규칙대로 정리한다.

## 막혔던 점 네 가지

처음부터 한 번에 되지 않았다. 오류 메시지를 읽고 하나씩 고쳤다.

**① ImportError: 이름이 다르다**

```text
ImportError: cannot import name 'hello' from 'hello'
```

`hello.py` 파일에서 `hello`라는 이름을 가져오려 했는데, 실제 함수 이름은 `greet`였다. 오류 문장을 그대로 읽으면 답이 들어 있었다.

**② 결과가 None: print와 return은 다르다**

```text
AssertionError: assert None == '안녕, 철수!'
```

함수 안에서 `print`로 화면에 찍기만 하고 값을 돌려주지 않았다. `print`는 보여 주기만 하고, 함수를 부른 쪽은 아무것도 받지 못한다(None). 테스트는 **돌려준 값**을 비교하므로 `return`을 써야 한다.

**③ `if __name__ == "__main__":`의 위치**

이 줄을 함수 안에 넣었더니 함수가 아무것도 하지 않았다. 이 줄은 "이 파일을 직접 실행했을 때만 아래를 실행하라"는 뜻이라 **파일 맨 아래, 함수 바깥**에 둔다. pytest가 파일을 가져갈 때는 `__name__`이 `"hello"`가 되어 아래 코드가 실행되지 않는다.

**④ Ruff I001: import 정리**

import 줄 정리 규칙에 맞지 않는다는 경고였다. `[*]` 표시가 있으면 Ruff가 자동으로 고칠 수 있다는 뜻이고, 아래 명령으로 고쳤다.

```bash
uv run ruff check --fix .
```

결과는 이렇게 나왔다.

```text
week0\test_hello.py ..                [100%]
2 passed in 0.04s

All checks passed!
```

AI 코딩 도구에 오류를 물어볼 때는 **답 대신 힌트를 달라고** 하면 직접 고치면서 배울 수 있다.

```text
파이썬 테스트를 돌렸더니 아래 오류가 났어.
{오류 메시지 전체}
정답 코드는 주지 말고, 오류 메시지를 어떻게 읽으면 되는지와 어디를 보면 되는지 힌트만 줘.
```

## 4. VS Code 설정

1. 확장(Extensions)에서 **Ruff**(제작: Astral Software)를 설치한다. 저장할 때 바로 검사 결과가 보인다.
2. `Ctrl+Shift+P` → "Python: Select Interpreter" → 목록에서 **이 프로젝트의 `.venv`**(오른쪽에 "작업 영역"이라고 표시된 것)를 고른다.

목록에는 컴퓨터에 있는 다른 파이썬(Anaconda, 다른 프로젝트 것)도 함께 보인다. 다른 것을 고르면 설치한 라이브러리를 찾지 못한다는 경고가 뜬다.

## 5. Git 기록과 GitHub 공개

```bash
git add .
git commit -m "연습 저장소 시작: 작업 환경과 첫 테스트"
git branch -m main
gh repo create python-basics --public --source=. --push
```

- `git add .`: 바뀐 파일을 이번 기록에 담는다.
- `git commit -m "..."`: 담은 내용을 메시지와 함께 기록으로 남긴다.
- `git branch -m main`: 기본 브랜치 이름을 `main`으로 바꾼다.
- `gh repo create ... --public --source=. --push`: GitHub CLI로 저장소를 공개로 만들고, 지금 폴더를 바로 올린다.

`uv init`은 Git 저장소까지 미리 만들어 둔다. 그래서 `git init`을 다시 치면 "Reinitialized"라고 나온다. 문제는 아니다.

**`.gitignore`에 `.venv`가 들어 있는 이유**도 짚고 넘어갔다. 처음엔 보안 때문이라고 생각했는데, `.venv` 안에는 비밀 정보가 없다. 실제 이유는 용량이 크고 내 컴퓨터 환경에 맞춰 만들어져서 다른 컴퓨터에서는 그대로 쓸 수 없기 때문이다. 대신 `pyproject.toml`과 `uv.lock`만 올리면 다른 사람은 `uv sync` 한 번으로 같은 환경을 만든다. 보안 때문에 Git에서 빼야 하는 건 API 키가 들어가는 `.env` 파일이다.

## 공개 전에 개인 이메일을 지웠다

올리기 직전에 확인해 보니 개인 이메일이 두 군데 들어 있었다.

- `uv init`이 `pyproject.toml`의 `authors`에 Git 설정의 이메일을 자동으로 넣었다.
- 커밋 기록의 작성자 이메일도 개인 주소였다.

공개 저장소의 커밋 기록은 누구나 볼 수 있고, 이메일을 긁어 가는 프로그램도 있다. 그래서 GitHub이 제공하는 **비공개용 주소(noreply)**로 바꿨다. 이 주소는 GitHub 설정의 Emails 메뉴에서 확인할 수 있다.

```bash
git config user.email "{GitHub noreply 주소}"
git config --global user.email "{GitHub noreply 주소}"
```

- 첫 줄은 이 저장소에만, `--global`이 붙은 둘째 줄은 앞으로 만들 모든 저장소에 적용된다.
- `pyproject.toml`의 `authors`는 이름만 남겼다.

여기서 한 번 더 막혔다. 파일을 고치고 새로 커밋했지만, **예전 커밋 안에 있던 예전 파일에는 이메일이 그대로 남아 있었다.** Git은 모든 버전을 기억하기 때문이다. 그래서 커밋을 하나로 합쳐 기록을 다시 쓰고 GitHub에 덮어썼다.

```bash
git reset --soft {첫 커밋 번호}
git commit --amend -m "연습 저장소 시작: 작업 환경(uv, pytest, Ruff)과 greet 함수 테스트"
git push --force origin main
```

- `reset --soft`: 첫 커밋 시점으로 되돌리되 파일은 지금 상태 그대로 둔다.
- `commit --amend`: 첫 커밋을 지금 파일로 다시 쓴다.
- `push --force`: GitHub의 기록을 새 기록으로 덮어쓴다. 다른 사람과 같이 쓰는 저장소에서는 쓰면 안 되는 명령이고, 혼자 쓰는 새 저장소라서 쓸 수 있었다.

처음에는 첫 커밋 번호 자리에 `$(git rev-list --max-parents=0 HEAD)`를 넣었는데 동작하지 않았다. 이 `$(...)` 문법은 PowerShell이나 bash에서만 되고, 내가 쓰던 **cmd(명령 프롬프트)**에서는 안 된다. `git log --oneline`으로 번호를 직접 확인해서 넣으니 됐다. 터미널 종류마다 문법이 다르다는 걸 알게 됐다.

마지막으로 기록 전체에서 이메일을 검색해 0건인 것을 확인했다.

```text
공개 GitHub 저장소에 올리기 전에 점검하고 싶어.
현재 파일과 지난 커밋 기록 전체에서 이메일 주소, API 키, 토큰처럼
공개되면 안 되는 내용이 있는지 찾는 방법을 알려 줘.
내 터미널은 {cmd / PowerShell / bash}야.
```

## 배운 점

- **오류 메시지에 답이 들어 있다.** ImportError도 None도 문장을 천천히 읽으니 원인이 보였다.
- **`print`와 `return`은 다르다.** 테스트를 쓰니 이 차이가 바로 드러났다.
- **테스트는 약속이다.** "빈 이름이면 '안녕!'"처럼 동작을 먼저 정하고, 함수와 테스트에 똑같이 적는다.
- **Git은 모든 버전을 기억한다.** 지금 파일만 고쳐서는 공개된 기록에 남은 정보가 사라지지 않는다. 공개 전에 기록 전체를 본다.
- **터미널마다 문법이 다르다.** 명령을 복사하기 전에 내가 쓰는 터미널을 확인한다.

## 다음에

남겨 둔 질문이 하나 있다. `greet("   ")`처럼 **공백만 있는 이름**은 지금 코드에서 "안녕,    !"이 된다. 이 경우에는 사용자에게 다시 입력하라고 안내하는 게 맞다고 생각했다. 함수는 잘못된 값이라고 알리기만 하고(예외), 다시 묻는 건 함수를 부른 쪽이 하도록 나눠서, 2주차 예외 처리 시간에 만들 예정이다.

다음 글은 파이썬 기본기를 빠르게 점검하는 문제 풀이다.

만들다가 궁금한 점은 댓글로 남겨주세요.
