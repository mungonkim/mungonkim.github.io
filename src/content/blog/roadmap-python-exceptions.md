---
title: '프로젝트 3 (3편) - 잘못된 입력을 예외로 다루기'
description: '공백만 있는 이름과 칸이 모자란 주문 줄을 ValueError로 막고, 여러 줄을 처리할 때는 잘못된 줄만 건너뛰며 기록을 남기게 했다. try 범위를 넓게 잡아서 내 오류 메시지가 덮였던 실수와 트레이스백 읽는 법을 정리했다.'
pubDate: 'Oct 14 2026'
category: '개발'
project: 'ai-engineer-roadmap'
part: 3
---

## 오늘 다룬 문제

지난 글 끝에서 두 가지를 남겨 두었다.

1. 0주차에 만든 `greet` 함수에 공백만 있는 이름(`"   "`)이 들어오면 `"안녕,    !"` 같은 이상한 인사가 나온다.
2. 1주차의 `parse_order`에 칸이 하나 모자란 줄을 넣으면 `IndexError`가 나면서 프로그램이 멈춘다.

둘 다 "잘못된 입력이 들어오면 어떻게 할까"라는 질문이다. 2주차 첫날은 이걸 **예외 처리**로 풀었다. 방식은 1주차와 같다. 테스트(문제지)가 먼저 있고, 함수는 내가 채운다. AI에게는 힌트만 받는다.

## 개념 짧게

| 문법 | 하는 일 |
|---|---|
| `try:` / `except ValueError:` | 오류가 날 수 있는 곳을 감싸고, 그 오류가 나면 대신 할 일을 정한다 |
| `raise ValueError("메시지")` | 잘못된 값을 받았을 때 내가 직접 오류를 낸다 |
| `except ValueError as e:` → `str(e)` | 잡은 오류의 메시지를 꺼낸다 |
| `raise ... from e` | 오류를 다른 오류로 바꿔 낼 때 원래 원인을 함께 남긴다 |
| `pytest.raises(ValueError, match="단어")` | 그 오류가 나고, 메시지에 그 단어가 있어야 테스트가 통과한다 |

`except`에는 **구체적인 오류 이름**을 쓴다. 이유는 뒤에서 다시 나온다.

문제지는 이런 프롬프트로 만들 수 있다.

```text
파이썬 예외 처리를 연습하고 싶어.
1. 주문 한 줄 "날짜,상품,수량,단가"를 딕셔너리로 바꾸는 함수를 문제로 만들어 줘.
   칸 수가 틀리거나, 상품이 비었거나, 수량·단가가 숫자가 아니면 ValueError를 내야 해.
   메시지에 들어갈 단어도 정해 줘 (예: "칸", "수량").
2. 여러 줄을 처리하면서 잘못된 줄은 건너뛰고 줄 번호와 이유를 기록하는 함수도 만들어 줘.
3. 함수 안은 비워 두고, pytest 테스트만 따로 만들어 줘. 정답 코드는 보여 주지 마.
```

## 문제 A. 공백만 있는 이름 막기

규칙은 세 가지였다.

- 이름 앞뒤 공백은 지운다: `greet("  철수 ")` → `"안녕, 철수!"`
- 공백만 있으면 `ValueError`를 낸다.
- 빈 문자열(`""`)은 어떻게 할지 **직접 정하고, 테스트도 직접 쓴다.**

공백을 먼저 지우고 나면 `"   "`와 `""`는 둘 다 빈 문자열이 된다. 그래서 빈 문자열도 오류로 정했다.

```python
def greet(name):
    name = name.strip()

    if name:
        return f"안녕, {name}!"
    else:
        raise ValueError("올바른 이름을 입력하세요")
```

이번에 처음으로 테스트를 직접 썼다. `with pytest.raises(...)` 안에서 함수를 불렀을 때 그 오류가 나야 통과한다.

```python
def test_greet_empty_string_raises():
    with pytest.raises(ValueError, match="이름"):
        greet("")
```

실행 부분은 제대로 된 이름이 들어올 때까지 다시 묻게 했다. `greet`가 오류를 내면 `except`에서 안내를 출력하고, 반복문이 처음으로 돌아간다. 성공하면 `break`로 빠져나온다.

```python
while True:
    try:
        name = input("이름을 입력하세요: ")
        print(greet(name))
        break
    except ValueError as e:
        print(f"잘못 입력하셨습니다. {e} 다시 시도하세요.")
```

함수는 오류를 **내기만** 하고, 사용자에게 다시 묻는 일은 함수를 **부르는 쪽**이 맡는다. 그래서 같은 `greet`를 나중에 웹 화면에 붙여도 그대로 쓸 수 있다.

## 문제 B-1. 주문 한 줄 검사하기

1주차의 `parse_order`는 잘못된 줄을 받으면 상황마다 다른 오류를 냈다.

- 칸이 모자라면 `IndexError: list index out of range`
- 수량이 `"세개"`면 `ValueError: invalid literal for int() with base 10: '세개'`

둘 다 무엇이 틀렸는지 알아보기 어렵다. 이번에는 전부 `ValueError` 하나로 맞추고, 메시지에 "칸", "상품", "수량", "단가" 중 하나를 넣기로 했다.

**첫 번째 막힘: `strip`과 `split`**

처음 코드는 15개 테스트 중 3개만 통과했다. 첫 줄이 이랬다.

```python
parts = line.strip(sep)   # 잘못된 코드
```

`strip(",")`은 문자열 **양 끝의** 쉼표를 지우고 **문자열을** 돌려준다. 나눠 주지 않는다. 그래서 `len(parts)`는 칸 수가 아니라 글자 수가 되고, 정상 줄도 "칸 수가 틀렸다"며 막혔다. `split(sep)`으로 바꾸자 대부분 통과했다. 이름이 비슷한 메서드는 `uv run python`에서 직접 한 줄 실행해 보면 바로 구분된다.

**두 번째 막힘: 내가 쓴 오류 메시지가 사라졌다**

`int("세개")`가 실패할 때 파이썬이 내는 메시지에는 "수량"이라는 말이 없다. 그래서 오류를 잡아서 내 메시지로 바꿔 냈다. 그런데 처음에는 범위 검사까지 `try` 안에 넣었다.

```python
try:
    qty = int(qty)
    if qty < 1:
        raise ValueError("수량은 1개 이상이어야 합니다.")
except ValueError as e:
    raise ValueError("수량 형식이 올바르지 않습니다.") from e
```

테스트는 메시지에 "수량"만 있으면 통과라서 통과했다. 하지만 수량 0을 넣고 직접 실행해 보니 이렇게 나왔다.

```text
  File "...orders.py", line 39, in parse_order
    raise ValueError("수량은 1개 이상이어야 합니다.")
ValueError: 수량은 1개 이상이어야 합니다.

The above exception was the direct cause of the following exception:

  File "...orders.py", line 41, in parse_order
    raise ValueError("수량 형식이 올바르지 않습니다.") from e
ValueError: 수량 형식이 올바르지 않습니다.
```

트레이스백은 위에서 아래로 일어난 순서다.

1. 위쪽: 내가 직접 낸 "1개 이상이어야 합니다"가 먼저 났다.
2. 가운데 문장: "위 오류가 아래 오류의 직접 원인"이라는 뜻이다. `from e`를 붙였기 때문에 보인다.
3. 아래쪽: 바로 밑의 `except ValueError`가 **내가 낸 오류까지** 잡아서 "형식이 올바르지 않습니다"로 덮어썼다.

수량 0은 형식이 아니라 범위가 틀린 건데, 사용자는 맨 아래 메시지만 본다. 고친 방법은 `try`가 감싸는 범위를 **실제로 실패할 수 있는 한 줄**로 좁히는 것이었다.

```python
try:
    qty = int(qty)
except ValueError as e:
    raise ValueError("수량 형식이 올바르지 않습니다.") from e

if qty < 1:
    raise ValueError("수량은 1개 이상이어야 합니다.")
```

다시 실행하니 `ValueError: 수량은 1개 이상이어야 합니다.` 한 줄만 남았다.

## 문제 B-2. 잘못된 줄만 건너뛰기

실제 데이터에는 잘못된 줄이 섞여 있기 마련이다. 한 줄 때문에 전체가 멈추면 안 된다. 그래서 여러 줄을 처리하는 함수는 오류를 **잡아서 기록하고 다음 줄로 넘어가게** 했다.

```python
for num_line, line in enumerate(lines, 1):
    if not line.strip():
        continue

    try:
        orders.append(parse_order(line, sep=sep))
    except ValueError as e:
        errors.append({"line": num_line, "reason": str(e)})
```

- `enumerate(lines, 1)`: 줄 번호를 1부터 센다. 사람이 보는 번호라서 0이 아니라 1부터다.
- 빈 줄은 오류로 치지 않고 `continue`로 건너뛴다.
- `str(e)`로 `parse_order`가 낸 메시지를 그대로 기록한다.

이렇게 역할이 나뉜다. `parse_order`는 **한 줄이 맞는지 판단해서 오류를 내고**, `parse_orders`는 **그 오류를 잡아서 기록한다.**

결과는 테스트 20개 통과(문제지 19개와 직접 쓴 1개)였고, `ruff check`와 `ruff format`도 통과했다.

```text
20 passed in 0.06s
```

## 확인 질문 두 개

**① `except ValueError` 대신 `except Exception`으로 잡으면 뭐가 문제일까**

처음에는 답하지 못했다. `Exception`은 거의 모든 오류를 잡는다. 예를 들어 코드에 `.strip()`을 `.stirp()`로 잘못 쓰면 `AttributeError`가 나는데, 이것까지 잡힌다. 그러면 **모든 줄이 "잘못된 데이터"로 기록되고 프로그램은 정상 종료**된다. 실제로는 내 코드의 버그인데 데이터 탓으로 보이고, 오류 화면도 안 뜬다. 그래서 예상한 실패(`ValueError`)만 잡고, 예상 못 한 버그는 그대로 터지게 둔다.

**② `int("2.5")`는 왜 오류가 날까. 받아 줘야 할까**

`int()`는 `"3"`처럼 정수 모양인 문자열만 받는다. 받아 주려면 `int(float("2.5"))`로 쓰면 되는데, 이건 반올림이 아니라 소수점 아래를 **버려서** 2가 된다. 그래도 받아 주면 안 된다고 답했다. 수량은 개수라서 2.5개는 데이터가 잘못 들어온 것이다. 몰래 2로 바꾸면 매출이 조용히 틀린다. 오류로 기록해서 사람이 보게 하는 편이 낫다.

## 배운 점

- **`try`는 좁게 감싼다.** 실패할 수 있는 줄만 넣는다. 넓게 감싸면 내가 낸 오류까지 잡혀서 메시지가 덮인다.
- **예외는 구체적인 이름으로 잡는다.** `except Exception`은 진짜 버그를 데이터 문제로 숨긴다.
- **오류를 내는 쪽과 처리하는 쪽을 나눈다.** 함수는 판단해서 오류를 내고, 다시 물을지 건너뛸지는 부르는 쪽이 정한다.
- **테스트가 통과해도 직접 실행해 본다.** 메시지가 덮인 문제는 테스트로는 안 보였고, 직접 실행한 트레이스백에서 보였다.

## 다음에

2주차 2일차는 파일 입출력과 JSON이다. 오늘 만든 `parse_orders`로 CSV 파일을 읽고, 정상 주문과 오류 목록을 JSON 파일로 저장한다. 파일이 없을 때의 오류(`FileNotFoundError`)와 테스트용 임시 폴더(`tmp_path`)도 다룬다.

코드는 [python-basics 저장소](https://github.com/mungonkim/python-basics)에 있다.

만들다가 궁금한 점은 댓글로 남겨주세요.
