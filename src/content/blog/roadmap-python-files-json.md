---
title: '프로젝트 3 (4편) - CSV를 읽어 JSON 보고서로 저장하기'
description: '주문 CSV 파일을 읽어 요약하고, 결과와 오류 목록을 JSON 파일로 저장하는 작은 명령줄 프로그램을 만들었다. Windows 기본 인코딩 cp949, 엑셀 CSV의 BOM, 종료 코드처럼 파일을 다루면서 처음 부딪힌 것들을 정리했다.'
pubDate: 'Oct 15 2026'
category: '개발'
project: 'ai-engineer-roadmap'
part: 4
---

## 오늘 만든 것

[지난 글](/blog/roadmap-python-exceptions/)에서 만든 `parse_orders`는 주문 줄 목록을 받아 정상 주문과 오류 목록으로 나눴다. 오늘은 그 앞뒤에 **파일**을 붙였다.

```text
주문 CSV 파일 → 읽기 → parse_orders → 요약 → JSON 파일로 저장
```

결과는 명령 한 줄로 실행된다.

```bash
uv run python week2/report.py week2/sample_orders.csv out/report.json
# 주문 4건, 오류 2건, 저장: out/report.json
```

방식은 지금까지와 같다. 테스트(문제지)가 먼저 있고, 함수는 내가 채우고, AI에게는 힌트만 받는다. 문제지는 이런 프롬프트로 만들 수 있다.

```text
파이썬 파일 입출력과 JSON을 연습하고 싶어. {이전에 만든 함수 설명, 예: 주문 줄 목록을 정상 주문과 오류로 나누는 parse_orders}를 이어서 쓸 거야.
1. CSV 읽기, 요약, JSON 저장, 전체 실행 함수를 문제로 만들어 줘. 함수 안은 비워 두고 docstring에 조건을 적어 줘.
2. 한글, BOM이 붙은 파일, 없는 파일, 틀린 헤더도 확인하는 pytest 테스트를 만들어 줘. 파일은 tmp_path로 만들어 줘.
3. 명령줄 실행 함수(main)는 테스트 없이, 종료 코드 0·1·2 규칙만 적어 줘.
4. 정답 코드는 보여 주지 마.
```

## 문제와 역할

| # | 함수 | 하는 일 |
|---|---|---|
| C-1 | `load_orders` | CSV를 읽고 헤더를 검사한 뒤 `parse_orders`에 넘긴다 |
| C-2 | `summarize` | 주문 수, 수량 합계, 매출 합계, 상품별 매출 |
| C-3 | `save_report` / `load_report` | JSON으로 저장하고 다시 읽는다 |
| C-4 | `run` | 읽기 → 요약 → 저장을 이어 붙인다 |
| C-5 | `main` | 명령줄 인자를 받고, 오류를 한 줄 안내로 바꾸고, 종료 코드를 정한다 |

함수 하나가 한 가지 일만 하니, 마지막에 이어 붙이는 `run`은 몇 줄이면 끝났다.

```python
def run(input_path, output_path):
    parsed = load_orders(input_path)
    summary = summarize(parsed["orders"])

    report = {
        "source": Path(input_path).name,
        "summary": summary,
        "errors": parsed["errors"],
    }
    save_report(report, output_path)
    return report
```

`Path(input_path).name`은 경로에서 폴더를 빼고 파일 이름(`sample_orders.csv`)만 꺼낸다.

## 테스트에서 파일을 만드는 법: tmp_path

파일을 읽는 함수를 테스트하려면 파일이 있어야 한다. pytest는 테스트 함수 인자에 `tmp_path`라고 쓰면 **테스트마다 새 빈 폴더**를 만들어 준다. 진짜 파일을 건드리지 않고, 끝나고 지울 필요도 없다.

```python
def test_load_orders_missing_file(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_orders(tmp_path / "없는파일.csv")
```

## 막힌 것 1. `open('path')`

C-1의 첫 코드는 테스트 6개 중 5개가 실패했고, 오류는 전부 같았다.

```text
FileNotFoundError: [Errno 2] No such file or directory: 'path'
```

함수가 받은 변수 `path`가 아니라, 이름이 `"path"`인 파일을 찾고 있었다. `open('path', ...)`에서 따옴표를 빼자 이 오류는 사라졌다. 오류 메시지 끝에 찍힌 파일 이름을 보면 바로 알 수 있는 실수였다.

## 막힌 것 2. 정상과 오류가 거꾸로 나왔다

따옴표를 고치고 나니 이번엔 결과가 정반대였다.

- 정상 파일을 넣으면 "헤더 형식이 일치하지 않습니다"
- 틀린 헤더(`date,item,qty,price`)를 넣으면 통과

헤더를 비교할 기준을 함수 안에서 직접 `"date,item,qty,price"`로 만들어 썼기 때문이다. 파일 맨 위에는 이미 상수가 있었다.

```python
HEADER = "날짜,상품,수량,단가"
```

같은 값을 두 곳에 따로 적으면 이렇게 서로 어긋난다. 상수를 쓰도록 바꾸니 통과했다. 이후로는 **문제를 풀기 전에 파일 위쪽의 상수와 import부터** 훑어보기로 했다.

## 막힌 것 3. Ruff의 RUF100

문제지의 import 줄에는 `# noqa: F401`이 붙어 있었다. "아직 안 쓰는 import라고 경고하지 마"라는 표시다. 함수를 채우고 나서 Ruff를 돌리니 이런 메시지가 나왔다.

```text
RUF100 [*] Unused `noqa` directive (unused: `F401`)
  --> week2\report.py:13:34
```

import를 실제로 쓰기 시작했으니, 막을 경고가 없는데 표시만 남았다는 뜻이다. 읽는 법을 정리하면 이렇다.

- `RUF100`: 규칙 번호
- `[*]`: `uv run ruff check . --fix`로 자동 수정할 수 있다
- `--> 파일:줄:칸`: 위치
- `help:` 아래 `-`, `+`: 빠질 줄과 들어갈 줄

## 인코딩: 이 컴퓨터의 기본값은 cp949였다

파일을 열 때 `encoding`을 꼭 적으라는 말을 들었는데, 빼면 어떻게 되는지 직접 실험했다.

처음에는 `encoding=""`으로 바꿨다. 그러자 전혀 다른 오류가 났다.

```text
LookupError: unknown encoding:
```

`encoding=""`은 인코딩을 빼는 게 아니라 **"이름이 빈 문자열인 인코딩"을 쓰라고 지정**한 것이다. 인자를 통째로 지워서 `open(path, "r")`로 해야 기본값이 쓰인다. 지난 글의 `greet("")`처럼, "값을 안 줌"과 "빈 값을 줌"은 다르다.

인자를 지우고 다시 돌리니 이렇게 나왔다.

```text
UnicodeDecodeError: 'cp949' codec can't decode byte 0xeb in position 0: illegal multibyte sequence
```

인코딩을 적지 않으면 파이썬은 운영체제 기본값을 쓰는데, 이 컴퓨터(Windows 한국어, Python 3.14)는 `cp949`였다. UTF-8로 저장한 한글을 `cp949` 규칙으로 읽으려다 실패한 것이다. 기본값은 이렇게 확인할 수 있다.

```bash
uv run python -c "import locale; print(locale.getpreferredencoding(False))"
```

"맥이나 리눅스도 똑같지 않을까"라고 생각했는데, 다르다.

| 환경 | 기본 인코딩 | 인코딩 없이 열면 |
|---|---|---|
| Windows 한국어 | `cp949` | 한글 UTF-8 파일에서 오류 |
| 맥, 리눅스 | `utf-8` | 대부분 읽힌다. 단, BOM 파일은 헤더 검사에서 실패 |

같은 코드가 어떤 컴퓨터에서는 되고 어떤 컴퓨터에서는 안 된다. 그래서 인코딩은 항상 직접 적는다.

## BOM: 엑셀 CSV의 보이지 않는 첫 글자

엑셀에서 "CSV UTF-8"로 저장하면 파일 맨 앞에 BOM이라는 보이지 않는 표시(`﻿`)가 붙는다. 그냥 `utf-8`로 읽으면 이게 첫 글자로 남아서, 첫 줄이 `﻿날짜,상품,...`이 되고 헤더와 달라진다.

`utf-8-sig`로 읽으면 BOM이 있으면 지우고, 없으면 그냥 읽는다. 문제지에 "BOM이 있어도 읽혀야 한다"는 조건만 있었는데, 인코딩 이름을 찾아서 처음부터 이걸로 풀었다.

```python
with open(path, "r", encoding="utf-8-sig") as f:
    first_line = f.readline()
```

실험 중에 하나 더 알게 된 게 있다. 틀린 헤더 테스트는 `pytest.raises(ValueError)`인데, 인코딩 오류(`UnicodeDecodeError`)도 여기에 잡혔다. 메시지만 달라서 실패했다. `UnicodeDecodeError`가 `ValueError`의 한 종류(자식 클래스)이기 때문이다. 예외에도 가족 관계가 있다.

## JSON으로 저장하기

```python
def save_report(report, path):
    path_obj = Path(path)
    path_obj.parent.mkdir(parents=True, exist_ok=True)

    with open(path_obj, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
```

- `parent.mkdir(parents=True, exist_ok=True)`: 저장할 폴더(`out/`)가 없으면 만든다. 상위 폴더까지 한 번에 만들고(`parents`), 이미 있어도 오류를 내지 않는다(`exist_ok`).
- `ensure_ascii=False`: 이 옵션이 없으면 한글이 `"사과"`처럼 저장된다. 먼저 `json.dumps({"상품": "사과"})`를 화면에 찍어 보고, 공식 문서에서 옵션을 찾았다.
- `indent=2`: 사람이 읽기 좋게 들여쓴다.

저장된 결과는 이렇다. 오류의 줄 번호 3과 7은 CSV 파일의 실제 줄 번호와 같다. 헤더가 1번 줄이라서, `parse_orders`가 준 번호에 1을 더했다.

```json
{
  "source": "sample_orders.csv",
  "summary": {
    "count": 4,
    "total_qty": 8,
    "total_sales": 13800,
    "sales_by_item": {
      "사과": 4800,
      "배": 4000,
      "우유": 5000
    }
  },
  "errors": [
    { "line": 3, "reason": "수량 형식이 올바르지 않습니다." },
    { "line": 7, "reason": "입력된 칸의 개수가 올바르지 않습니다." }
  ]
}
```

결과 파일이 생기는 `out/` 폴더는 `.gitignore`에 넣었다. 실행할 때마다 다시 만들어지는 결과물은 저장소에 넣지 않는다.

## 명령줄 실행과 종료 코드

`main`은 테스트 없이 직접 실행해서 확인했다. 처음에는 함수 안을 채우기 전에 실행해서 세 번 모두 트레이스백과 종료 코드 1이 나왔다. 처리하지 않은 예외로 프로그램이 죽으면 파이썬은 종료 코드를 1로 남긴다. 그래서 성공인지, 파일이 없는지, 사용법이 틀렸는지 구분할 수 없었다.

구현한 뒤 결과는 이렇다. cmd에서는 바로 앞 명령의 종료 코드를 `echo %errorlevel%`로 본다.

| 실행 | 출력 | 종료 코드 |
|---|---|---|
| 정상 파일 | `주문 4건, 오류 2건, 저장: out/report.json` | 0 |
| 없는 파일 | `오류: 파일 '없는파일.csv'을(를) 찾을 수 없습니다.` | 1 |
| 인자 없음 | `사용법: report.py <입력_CSV_경로> <출력_JSON_경로>` | 2 |

```python
try:
    report = run(input_path, output_path)
except FileNotFoundError:
    print(f"오류: 파일 '{input_path}'을(를) 찾을 수 없습니다.")
    return 1
except ValueError as e:
    print(f"오류: 입력 파일을 처리할 수 없습니다 ({e})")
    return 1
```

## 확인 질문 두 개

**① `FileNotFoundError`를 `load_orders` 안이 아니라 `main`에서 잡는 이유**

"오류가 세분화되어 있지 않아서"라고 답했는데, 핵심은 달랐다. 파일이 없을 때 어떻게 할지는 **부르는 쪽마다 다르다.**

| 부르는 곳 | 파일이 없을 때 |
|---|---|
| 명령줄 프로그램 | 한 줄 안내, 종료 코드 1 |
| 웹 서버 | 404 응답 |
| 여러 파일을 처리하는 프로그램 | 그 파일만 건너뛰기 |
| 테스트 | `FileNotFoundError`가 나는지 확인 |

`load_orders`가 안에서 잡아 `print`해 버리면 다른 쪽은 고를 기회가 없다. 함수는 알리기만 하고, 처리는 부르는 쪽이 정한다. 지난 글의 `greet`와 같은 원칙이다.

**② 종료 코드는 누가 쓸까**

"컴퓨터가 오류를 확인하는 부분"이라고 답했고, 맞았다. 이 프로그램을 실행하는 **다른 프로그램**(배치 파일, cron, GitHub Actions)이 종료 코드를 읽는다. 0이면 다음 단계로, 0이 아니면 멈추거나 알림을 보낸다. 내가 운영 중인 카드뉴스 자동화도 어떤 단계가 0이 아닌 코드로 끝나면 GitHub Actions가 실패로 표시하고 슬랙으로 알림이 온다. 1과 2를 나눠 두면 실패의 종류까지 구분할 수 있다.

## 배운 점

- **인코딩은 항상 적는다.** 기본값은 컴퓨터마다 다르다. 엑셀 CSV는 `utf-8-sig`.
- **"값을 안 줌"과 "빈 값을 줌"은 다르다.** `encoding=""`은 기본값이 아니다.
- **같은 값은 한 곳에만 둔다.** 상수를 두고 함께 쓴다.
- **함수는 오류를 알리고, 처리는 부르는 쪽이 한다.** 사용자와 만나는 `main`에서 한 줄 안내와 종료 코드로 바꾼다.
- **오류 메시지는 끝까지 읽는다.** `'path'`, `'cp949'`, `unknown encoding:`처럼 원인이 메시지 안에 다 있었다.

## 다음에

2주차 3일차는 타입 힌트와 클래스다. 오늘까지 딕셔너리로 주고받던 주문을 클래스로 바꿔 볼 예정이다.

코드는 [python-basics 저장소](https://github.com/mungonkim/python-basics)에 있다.

만들다가 궁금한 점은 댓글로 남겨주세요.
