---
title: '프로젝트 3 (5편) - 주문을 클래스로 바꾸고 타입 힌트 붙이기'
description: '딕셔너리로 주고받던 주문을 Order, OrderBook 클래스로 바꾸고 mypy --strict를 통과시켰다. 이번부터 개념 → 예측 실습 → 테스트 순서로 바꿨고, 기본값 빈 리스트 함정과 "500500" 실험이 가장 기억에 남았다.'
pubDate: 'Oct 28 2026'
category: '개발'
project: 'ai-engineer-roadmap'
part: 5
---

## 오늘 만든 것

[지난 글](/blog/roadmap-python-files-json/)까지 주문 한 건은 딕셔너리였다.

```python
{"date": "2026-10-14", "item": "사과", "qty": 3, "price": 1200, "total": 3600}
```

오늘은 이걸 **클래스**로 바꿨다. 주문 한 건은 `Order`, 주문 여러 개를 담는 장부는 `OrderBook`이다. 그리고 모든 메서드에 **타입 힌트**를 붙여 `mypy --strict` 검사를 통과시켰다.

```python
book = OrderBook([Order("2026-10-14", "사과", 3, 1200)])
book.add(Order.from_line("2026-10-15,배,2,2000"))
print(len(book), book.total_sales())   # 2 7600
```

## 진행 방식을 바꿨다: 개념 → 예측 실습 → 테스트

지금까지는 개념을 짧게 읽고 바로 테스트(문제지)를 풀었다. 그러다 보니 테스트를 풀면서 개념을 처음 만나는 일이 많았다. 그래서 이번부터 순서를 바꿨다.

1. **개념**: 설명과 예시 코드를 본다
2. **예측 실습**: 짧은 코드를 보고 결과를 **먼저 적은 다음** `uv run python`에 붙여 넣어 실행하고, 예측과 비교한다
3. **테스트**: 그다음에 문제지를 푼다

예측을 먼저 적는 게 핵심이다. 틀린 예측이 제일 오래 기억에 남는다. 이렇게 진행하고 싶다면 이런 프롬프트를 쓸 수 있다.

```text
파이썬 {주제, 예: 클래스와 타입 힌트}를 배우고 있어. 바로 문제를 풀지 말고 이 순서로 진행해 줘.
1. 개념 하나를 짧게 설명하고 예시 코드를 보여 줘.
2. 그 개념으로 5줄 안팎의 코드와 ①②③ 표시를 주고, 결과를 먼저 예측하게 해 줘. 내가 예측과 실행 결과를 보내면 틀린 부분을 설명해 줘.
3. 개념을 다 끝내면 pytest 테스트 문제지를 만들어 줘. 정답 코드는 보여 주지 말고 힌트만 줘.
```

개념은 다섯 개였다.

| # | 개념 | 실습에서 본 것 |
|---|---|---|
| 1 | 클래스, 객체, `__init__`, `self` | 같은 설계도로 만든 객체도 값은 따로 가진다 |
| 2 | 메서드와 `@property` | 괄호의 차이 |
| 3 | `==`와 `dataclass` | 내용이 같아도 `False`가 나오는 이유 |
| 4 | 기본값 빈 리스트 함정 | 예측이 가장 많이 틀린 실습 |
| 5 | 타입 힌트와 mypy | `500500` |

## 실습 2: 괄호 하나 차이

```python
class Cup:
    def __init__(self, color, size, price):
        self.color = color
        self.size = size
        self.price = price

    def describe(self):
        return f"{self.color} 컵 {self.size}ml"

    @property
    def price_per_ml(self):
        return self.price / self.size

a = Cup("빨강", 300, 1500)
print(a.describe())        # ① 빨강 컵 300ml
print(a.price_per_ml)      # ② 5.0
print(a.describe)          # ③ ?
a.price_per_ml = 1         # ④ ?
```

③은 `빨강 컵 300ml`이 나올 거라고 예측했는데 틀렸다.

```text
<bound method Cup.describe of <__main__.Cup object at 0x...>>
```

메서드는 괄호를 붙여야 실행된다. 괄호가 없으면 "이 객체에 붙은 메서드가 여기 있다"는 정보만 나온다. 오류가 나지 않아서 실수하면 찾기 어렵다.

④는 예측하지 못했다.

```text
AttributeError: property 'price_per_ml' of 'Cup' object has no setter
```

`@property`는 메서드를 괄호 없이 **속성처럼 읽게** 해 주는데, 기본으로 읽기 전용이다. 계산해서 나오는 값이라 직접 넣을 수 없다. 그리고 ②가 `5`가 아니라 `5.0`인 것도 짚고 넘어갔다. 파이썬의 `/`는 나누어떨어져도 항상 실수를 돌려준다.

정리하면 이렇다.

- `order.total`: 괄호 없음 → property (수량 × 단가를 읽을 때마다 계산)
- `order.to_dict()`: 괄호 있음 → 메서드

## 실습 3: 내용이 같은데 `False`

```python
a = Cup("빨강", 300)
b = Cup("빨강", 300)
print(a == b)    # False
print(a)         # <__main__.Cup object at 0x...>
```

그냥 만든 클래스의 `==`는 "내용이 같은지"가 아니라 **"같은 물건인지"**를 본다. 클래스 위에 `@dataclass`를 붙이면 `__init__`, `==`, 보기 좋은 출력(`Mug(color='빨강', size=300)`)을 자동으로 만들어 준다.

이 실습에서 하나 더 확인했다.

```python
@dataclass
class Mug:
    color: str
    size: int

print(Mug("파랑", "큰거"))   # Mug(color='파랑', size='큰거')
```

`size: int`라고 적었는데 문자열이 오류 없이 들어갔다. **타입 힌트는 실행할 때 검사되지 않는다.** 이게 실습 5로 이어진다.

## 실습 4: 기본값 빈 리스트 함정

이번 실습에서 예측이 가장 많이 틀렸다.

```python
class Box:
    def __init__(self, items=[]):
        self.items = items

    def add(self, x):
        self.items.append(x)

b1 = Box()
b2 = Box()
b1.add("사과")
print(b2.items)              # 예측: []
b4 = Box()
print(b4.items)              # 예측: []
print(b1.items is b2.items)  # 예측: False
```

실제 결과는 이랬다.

```text
['사과']
['사과']
True
```

`b1`에만 넣은 사과가 `b2`에도, 나중에 만든 `b4`에도 들어 있었다. 이유는 기본값이 만들어지는 때에 있다.

```text
def __init__(self, items=[]) 를 정의하는 순간
  → 빈 리스트 하나가 만들어져 기본값으로 보관됨 (딱 한 번)

b1 = Box()  → b1.items ─┐
b2 = Box()  → b2.items ─┼──→  같은 리스트 하나
b4 = Box()  → b4.items ─┘
```

기본값은 함수를 부를 때마다 새로 만들어지는 게 아니라 **정의할 때 한 번만** 만들어진다. `is`는 "같은 물건인지" 확인하는데, `True`가 나왔으니 정말 같은 리스트다. 무서운 점은 **오류가 나지 않는다**는 것이다. 장부 A에 넣은 주문이 장부 B의 합계에도 조용히 섞인다.

### 처음 고친 방법은 틀렸다

고쳐 보라는 실습에서 처음에는 이렇게 했다.

```python
b2 = Box([])   # 빈 리스트를 직접 넘김
b4 = Box([])
```

출력은 원하는 대로 나왔다. 그런데 고친 곳이 클래스가 아니라 **부르는 쪽**이었다. 클래스 안의 `items=[]`는 그대로라서, 누군가 `Box()`라고 쓰는 순간 같은 문제가 생긴다. 쓰는 사람이 매번 `Box([])`를 기억해야 하는 방식으로는 언젠가 한 번은 놓친다. 실제로 테스트도 `OrderBook()`처럼 인자 없이 만든다.

두 번째에 클래스 안을 고쳤다.

```python
class Box:
    def __init__(self, items=None):
        self.items = [] if items is None else items
```

기본값 자리에는 바뀌지 않는 `None`을 두고, `__init__`이 실행될 때마다 새 리스트를 만든다. `None`인지 확인할 때는 `==`보다 `is`를 쓴다.

## 실습 5: 실행은 `500500`, mypy는 오류

```python
def total_price(qty: int, price: int) -> int:
    return qty * price

def find_item(items: list[str], name: str) -> str | None:
    for item in items:
        if item == name:
            return item
    return None

print(total_price(2, "500"))   # ①
found = find_item(["사과", "배"], "감")
print(found.upper())           # ②
```

`uv run python`으로 실행한 결과는 이렇다.

```text
500500
AttributeError: 'NoneType' object has no attribute 'upper'
```

①은 **오류 없이 틀린 값**이 나왔다. 문자열 `"500"`에 2를 곱하면 글자가 두 번 반복된다. 매출이 1000원이 아니라 `500500`으로 찍혀도 프로그램은 아무 말이 없다.

같은 파일을 mypy로 검사하면 실행하지 않고도 둘 다 잡는다. mypy는 타입 힌트를 검사하는 도구이고, `uv add --dev mypy`로 설치했다.

```bash
uv run mypy --strict week2/hint_practice.py
```

```text
error: Argument 2 to "total_price" has incompatible type "str"; expected "int"  [arg-type]
error: Item "None" of "str | None" has no attribute "upper"  [union-attr]
error: Function is missing a type annotation  [no-untyped-def]
```

- 실행 중 검사(`if`, `raise`, `isinstance`)는 그 줄이 **실제로 실행돼야** 문제를 잡는다.
- mypy는 **실행 전에** 파일 전체를 훑는다.
- `--strict`를 붙이면 힌트가 빠진 함수도 오류로 잡는다(세 번째 줄).

## 테스트: Order와 OrderBook

개념 실습을 마치고 테스트 18개를 풀었다. 1~2일차 31개와 합쳐 49개가 목표였다.

| # | 클래스 | 할 일 |
|---|---|---|
| D-1 | `Order` | 만들 때 검사, `total`, `to_dict`, `from_line`(문자열 한 줄로 만들기), `==` |
| D-2 | `OrderBook` | `add`(Order만 받기), `len()`, 매출 합계, 상품별 매출, 날짜로 걸러 새 장부 만들기 |
| D-3 | 타입 힌트 | `mypy --strict` 통과 |

통과 개수는 이렇게 늘었다.

```text
3 → 5 → 6 → 9 → 12 → 15 → 18 (전체 49 passed)
```

### 막힌 것 1. 지운 줄 알았던 `raise NotImplementedError`

문제지의 빈 함수에는 "아직 안 만들었음" 표시로 `raise NotImplementedError`가 들어 있다. `__init__`의 검사 코드를 다 써 놓고 이 줄을 남겨 둬서, 검사를 통과해도 `self.date = date`까지 가지 못했다. 처음 지우고 돌렸을 때도 결과가 그대로였는데, 다시 확인해 보니 37번 줄에 그대로 남아 있었다. 오류 화면에서 `>` 표시가 붙은 줄이 실제로 멈춘 위치다.

```text
>       raise NotImplementedError
E       NotImplementedError

week2\models.py:37: NotImplementedError
```

### 막힌 것 2. `assert No...`

`from_line`을 쓰고 돌리니 이런 실패가 나왔다.

```text
FAILED week2/test_models.py::test_order_from_line - AssertionError: assert No...
```

`assert None == ...`이 잘린 것이었다. 칸 나누기, 정수로 바꾸기까지 써 놓고 마지막에 `Order`를 만들어 **돌려주는 줄을 빠뜨렸다.** 함수가 `return` 없이 끝나면 파이썬은 `None`을 돌려준다.

```python
@classmethod
def from_line(cls, line: str, sep: str = ",") -> Order:
    parts = line.split(sep)
    if len(parts) != 4:
        raise ValueError("입력된 칸의 개수가 올바르지 않습니다.")
    ...
    return cls(parts[0].strip(), parts[1].strip(), qty, price)
```

`cls`는 이 메서드를 부른 클래스, 즉 `Order`다. 고치고 나니 "수량 0", "상품 공백" 테스트 2개도 같이 통과했다. 그 검사는 `from_line`에 따로 쓰지 않고 `__init__`에 맡겨 두었는데, `Order`를 만들지 않으니 검사도 실행되지 않았던 것이다. 같은 검사를 두 곳에 쓰지 않는 게 이 문제의 의도였다.

### 장부는 2일차 코드를 옮겨 왔다

`OrderBook`의 `__init__`은 실습 4에서 고친 모양을 그대로 썼다. 넘겨받은 리스트는 `list(...)`로 복사해서 저장했다. 바깥 리스트와 장부가 같은 리스트를 쓰면, 장부에 `add`할 때 바깥 리스트도 몰래 늘어나기 때문이다.

```python
def __init__(self, orders: list[Order] | None = None) -> None:
    self.orders = [] if orders is None else list(orders)

def add(self, order: Order) -> None:
    if not isinstance(order, Order):
        raise TypeError("Order must be an Order")
    self.orders.append(order)
```

`sales_by_item`은 어디서부터 써야 할지 막혔는데, 지난 글의 `summarize`에 같은 계산이 이미 있었다. 바꾼 건 세 가지뿐이다.

| 2일차 `summarize` | 오늘 `OrderBook` |
|---|---|
| `orders`를 인자로 받음 | 장부가 이미 가짐 → `self.orders` |
| `order["item"]` | `order.item` |
| 큰 딕셔너리 하나로 돌려줌 | 메서드마다 자기 값 하나만 |

```python
def total_sales(self) -> int:
    return sum(order.total for order in self.orders)
```

### 막힌 것 3. mypy 오류가 오히려 늘었다

D-3는 오류 6개에서 시작했다. 하나씩 힌트를 붙였는데 두 번 오류가 늘었다.

**첫 번째**: `to_dict`에 `-> dict[str | int]`라고 썼더니 오류 1개가 2개가 됐다.

```text
error: "dict" expects 2 type arguments, but 1 given  [type-arg]
```

딕셔너리 힌트는 `dict[키 타입, 값 타입]`처럼 쉼표로 나눈 두 칸이다. 쉼표가 없으니 한 칸으로 읽혔다. 값이 문자열일 수도, 정수일 수도 있으니 `str | int`는 값 칸에 들어가야 한다.

**두 번째**: `from_line`에 힌트를 붙이자 오류가 7개로 늘었다.

```text
error: Incompatible types in assignment (expression has type "int", variable has type "str")
error: Argument 3 to "Order" has incompatible type "str"; expected "int"
```

틀려서 늘어난 게 아니었다. 힌트가 없는 함수는 "힌트가 없다"는 오류 하나만 나고 안쪽은 자세히 보지 않는다. 힌트를 붙이자 **안쪽까지 검사가 시작된 것**이다. 원인은 같은 변수 이름을 다른 타입으로 다시 쓴 데 있었다.

```python
qty = parts[2].strip()   # 처음엔 문자열
qty = int(qty)           # 같은 이름에 정수
```

파이썬은 실행에 아무 문제가 없지만, mypy는 처음 넣은 값을 보고 `qty`를 `str` 변수로 정한다. 글자일 때와 숫자일 때 이름을 나눴다.

```python
qty_str = parts[2].strip()
try:
    qty = int(qty_str)
except ValueError as e:
    raise ValueError("수량이 정수가 아닙니다.") from e
```

중간에 `->` 뒤에 `str, str, int, int`를 쓰려고도 했다. 함수 안에서 다루는 조각들의 타입이다. 하지만 `->`는 **마지막에 `return`하는 것 하나**의 타입이고, `from_line`이 돌려주는 건 조각 네 개가 아니라 `Order` 하나다.

결과는 이렇다.

```text
uv run mypy --strict week2/models.py
Success: no issues found in 1 source file

uv run pytest week2 -q
49 passed
```

## 확인 질문 세 개

**① 타입 힌트는 실행 중에 검사되지 않는데, `add`에서 `isinstance`로 따로 검사하는 이유**

"`Order`가 아닌 다른 값이 들어오는 걸 막으려고"라고 답했다. 덧붙이면, mypy는 실행 전에 **내 코드만** 본다. 실행 중에 다른 코드나 파일에서 딕셔너리가 들어오는 건 막지 못한다. 실행 중에 꼭 막아야 하는 값은 직접 검사한다.

**② 기본값 `orders=[]`가 왜 문제인가**

"리스트가 공유되어 재사용된다"고 답했다. 기본값은 정의할 때 한 번만 만들어지기 때문이다.

**③ 딕셔너리 대신 `Order` 클래스를 쓰면 좋은 점**

"데이터와 기능을 함께 관리할 수 있다"고 답했다. `order.total`, `order.to_dict()`처럼 계산이 데이터 옆에 붙어 있다. 두 가지를 더 배웠다.

- **잘못된 값이 처음부터 못 들어온다.** `__init__`에서 검사하니 `Order`가 만들어졌다면 수량 0인 주문은 없다고 믿고 쓸 수 있다.
- **오타를 일찍 잡는다.** `order["itme"]`은 실행해야 `KeyError`가 나지만, `order.itme`은 mypy와 VS Code가 실행 전에 알려 준다.

## 배운 점

- **예측을 먼저 적으면 틀린 곳이 남는다.** 이번에 가장 오래 기억할 건 맞힌 실습이 아니라 틀린 실습 4다.
- **기본값에 리스트나 딕셔너리를 쓰지 않는다.** `None`을 두고 안에서 새로 만든다.
- **고칠 곳은 문제가 생기는 곳이다.** 부르는 쪽을 바꿔 피해 가면 문제는 그대로 남는다.
- **타입 힌트는 실행 중에는 아무것도 막지 않는다.** 미리 찾는 건 mypy, 실행 중에 막는 건 직접 쓴 검사다.
- **변수 하나에는 타입 하나.** 글자와 숫자는 이름을 나눈다.
- **함수 끝에 `return`이 없으면 `None`이다.** `assert None == ...`이 보이면 `return`부터 확인한다.

## 다음에

2주차의 마지막 범위는 `httpx`로 공개 API를 호출하는 것이다. API 키가 필요 없는 공개 API로 데이터를 받아 오고, 네트워크 오류도 테스트해 볼 예정이다.

코드는 [python-basics 저장소](https://github.com/mungonkim/python-basics)에 있다.

만들다가 궁금한 점은 댓글로 남겨주세요.
