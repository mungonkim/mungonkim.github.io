---
title: '프로젝트 3 (6편) - 날씨 API를 부르고, 실패를 테스트하기'
description: 'httpx로 Open-Meteo 날씨 API를 불러 현재 기온을 가져오는 프로그램을 만들었다. 서버가 400을 돌려줘도 오류가 나지 않는다는 것, 실패의 종류, 그리고 진짜 인터넷 없이 가짜 서버로 실패를 테스트하는 방법을 정리했다.'
pubDate: 'Nov 04 2026'
category: '공부 기록'
project: 'ai-engineer-roadmap'
part: 6
---

## 오늘 만든 것

지금까지는 내 컴퓨터 안의 파일만 다뤘다. 오늘은 처음으로 **인터넷에서 데이터를 받아 오는** 프로그램을 만들었다.

```bash
uv run python week2/weather.py 37.57 126.98
# 2026-11-04T14:15 기온 16.8°C, 바람 5.4km/h
```

숫자 두 개는 위도와 경도(서울)다. 쓴 API는 [Open-Meteo](https://open-meteo.com/en/docs)로, API 키 없이 무료로 쓸 수 있는 날씨 API다. HTTP 요청은 파이썬 라이브러리 `httpx`로 보냈다.

```bash
uv add httpx
```

진행은 [지난 글](/blog/roadmap-python-classes-types/)과 같다. 개념 하나마다 짧은 코드의 결과를 **먼저 예측하고** 실행해서 비교했고, 개념을 다 마친 뒤 테스트 문제지를 풀었다. 이번부터는 개념마다 읽을 자료 2~3개를 같이 받고, 개념을 마칠 때 **한 줄 정의를 내 말로** 적는 단계를 더했다.

```text
파이썬 {주제, 예: httpx로 공개 API 호출}를 배우고 있어. 이 순서로 진행해 줘.
1. 개념 하나를 짧게 설명하고, 읽을 자료 2~3개를 "무엇을 보면 되는지"와 함께 줘. 공식 문서를 먼저, 한국어 자료가 있으면 같이 줘.
2. 5줄 안팎의 코드와 ①②③ 표시를 주고 결과를 먼저 예측하게 해 줘.
3. 개념이 끝나면 한 줄 정의를 내 말로 적게 해 줘.
4. 개념을 다 마치면 pytest 문제지를 만들어 줘. 진짜 인터넷 대신 가짜 응답으로 테스트하게 하고, 정답 코드는 보여 주지 마.
```

## 개념 1. HTTP 요청과 응답

```text
GET https://api.open-meteo.com/v1/forecast?latitude=37.57&longitude=126.98&current=temperature_2m
└┬┘ └──────────────┬───────────────────┘ └──────────────────┬──────────────────────────────┘
메서드          주소(어디로)                   쿼리 파라미터(무엇을 원하는지)
```

응답은 **상태 코드**(200 성공, 4xx 요청한 쪽 잘못, 5xx 서버 쪽 잘못)와 **본문**(보통 JSON)으로 온다. 내가 적은 한 줄 정의는 이렇다.

> HTTP 요청과 응답은 클라이언트가 서버에 데이터를 요청하고, 서버가 그 요청을 처리한 결과를 돌려주는 과정이다.

첫 실습에서 일부러 위도를 999로 보냈다.

```python
r2 = httpx.get(url, params={"latitude": 999, "longitude": 126.98, "current": "temperature_2m"})
print(r2.status_code)    # 400
print(r2.json())         # {'error': True, 'reason': 'Latitude must be in range of -90 to 90°. Given: 999.0.'}
```

**파이썬 오류가 나지 않았다.** `httpx`는 서버가 "잘못된 요청"이라고 답해도 응답을 받는 데는 성공했다고 보고 그냥 넘어간다. 상태 코드를 확인하지 않으면 실패한 응답을 정상인 줄 알고 쓰게 된다.

`params=`에 딕셔너리를 넘기면 `?`와 `&`는 `httpx`가 알아서 붙인다. 응답의 위도는 37.57이 아니라 37.55로 왔는데, 날씨 데이터가 격자 단위라 가장 가까운 점으로 맞춰 준 것이다.

## 개념 2. 응답 다루기

```python
r.raise_for_status()   # 4xx · 5xx면 여기서 httpx.HTTPStatusError, 2xx면 지나감
data = r.json()
print(data["current"]["temperature_2m"])        # 7.6 같은 숫자
print(data["current_units"]["temperature_2m"])  # °C
```

이 실습에서 하나 더 봤다. `current`를 빼고 요청하면 상태 코드는 **200인데 `current` 키가 없다.** `data["current"]`는 `KeyError: 'current'`를 낸다. `raise_for_status()`를 통과했다고 내용이 맞다는 보장은 없다. 값을 꺼낼 때도 한 번 더 확인해야 한다.

## 개념 3. 실패의 종류

| 종류 | 상황 | httpx 오류 |
|---|---|---|
| 답은 왔는데 실패 | 400, 404, 500, 503 | `HTTPStatusError` |
| 답을 못 받음 | 주소가 없음, 인터넷 끊김, 너무 오래 걸림 | `ConnectError`, `TimeoutException` 등 |

```text
httpx.HTTPError
├── httpx.HTTPStatusError       ← 답은 왔는데 4xx · 5xx
└── httpx.RequestError          ← 답을 못 받음
    ├── ConnectError
    └── TimeoutException
```

여기서 예측을 하나 틀렸다.

```python
httpx.get("https://no-such-host.invalid/")   # 예측: InvalidURL → 실제: ConnectError
```

`.invalid`는 절대 존재하지 않는 주소로 정해진 이름이다. 그래서 주소가 잘못됐다는 `InvalidURL`이 나올 줄 알았다. 그런데 `InvalidURL`은 `https://`가 빠진 것처럼 **주소의 모양 자체가 틀렸을 때** 난다. 이 주소는 모양은 올바르니 실제로 연결을 시도했고, 그런 서버가 없어서 연결 단계에서 실패했다. 주소를 잘못 적은 편지와, 주소는 맞는데 그런 집이 없는 편지의 차이다.

`httpx`는 응답을 기본 **5초** 기다린다. 타임아웃이 없으면 서버가 멈췄을 때 프로그램도 끝없이 기다린다. `timeout=0.001`로 주니 `ConnectTimeout`이 났다.

## 개념 4. 진짜 인터넷 없이 테스트하기

테스트에서 진짜 서버를 부르면 인터넷이 끊겼을 때 내 코드가 맞아도 실패하고, 기온이 매번 달라 결과를 비교할 수 없다. 무엇보다 **서버 오류나 타임아웃을 일부러 만들 수 없다.** 그래서 `httpx`의 가짜 서버 `MockTransport`를 썼다.

```python
def handler(request: httpx.Request) -> httpx.Response:
    return httpx.Response(200, json={"current": {"temperature_2m": 21.5}})

client = httpx.Client(transport=httpx.MockTransport(handler))
r = client.get("https://no-such-host.invalid/")
print(r.status_code)   # 200
```

없는 주소인데 200이 나왔다. 가짜 서버가 대신 답해서 **인터넷에 전혀 나가지 않았다**는 증거다. 인터넷 끊김도 흉내 낼 수 있다.

```python
def broken(request: httpx.Request) -> httpx.Response:
    raise httpx.ConnectError("인터넷 끊김", request=request)
```

이걸 쓰려면 함수가 `httpx.get`을 직접 부르지 않고 **`client`를 인자로 받아야** 한다. 실제로 쓸 때는 진짜 `httpx.Client()`를, 테스트할 때는 가짜 서버를 끼운 `Client`를 넘긴다. 필요한 걸 밖에서 넣어 주는 이 방식을 의존성 주입이라고 한다.

## 문제지: weather.py

| # | 함수 | 할 일 |
|---|---|---|
| E-1 | `CurrentWeather`, `parse_current` | 응답 JSON에서 시각 · 기온 · 풍속 꺼내기, 키가 없으면 `WeatherError` |
| E-2 | `build_params` | 위도 · 경도 범위 검사, 쿼리 파라미터 만들기 |
| E-3 | `fetch_current` | 요청 보내기, 실패 6가지를 `WeatherError`로 바꾸기 |
| E-4 | `format_weather` | 사람이 읽을 한 줄 |
| E-5 | `main` | 명령줄 실행, 종료 코드 0 · 1 · 2 (테스트 없음) |

테스트는 22개였고, 모두 가짜 서버로 돈다. 이번에는 문제지에 타입 힌트가 미리 붙어 있었고, 채운 코드도 `mypy --strict`를 통과해야 했다.

### 막힌 것 1. 범위 검사가 거꾸로였다

처음 쓴 조건은 이랬다.

```python
if latitude > -90 or longitude < 90:
    raise ValueError("위도 범위를 벗어났습니다.")
```

정상인 서울 좌표를 넣어도 오류가 났다. 37.57을 넣어 보면 `37.57 > -90`이 `True`이고, `or`는 하나만 참이어도 참이다. 이 조건은 "범위 **안**"을 쓴 모양인데, `raise`는 "범위 **밖**"일 때 해야 한다. 위도를 검사하는 줄에 경도가 섞여 있기도 했다. 정상 값, 끝값(90), 범위 밖 값(91)을 하나씩 넣어 보며 고쳤다.

```python
if latitude < -90 or latitude > 90:
    raise ValueError("위도 범위를 벗어났습니다.")
```

끝값 90은 정상이어야 해서 `<=`가 아니라 `<`, `>`를 썼다.

### 막힌 것 2. 없는 속성 이름

4xx와 5xx를 나누려고 상태 코드를 꺼냈는데, mypy가 바로 잡았다.

```text
error: "HTTPStatusError" has no attribute "response_code"; maybe "response"?  [attr-defined]
```

`e.response`가 서버가 보낸 응답 객체이고, 상태 코드는 그 안의 `status_code`다. 실습 1에서 `r.status_code`로 꺼낸 것과 같다. 테스트를 돌리기 전에 mypy가 "혹시 이거냐"고 이름까지 알려 줬다.

### 막힌 것 3. 한 줄에만 빠진 `from e`

5xx 테스트 2개가 계속 실패했다.

```text
E   where False = isinstance(None, <class 'httpx.HTTPStatusError'>)
E     where None = WeatherError('서버 오류').__cause__
```

메시지("서버")는 맞았는데, 원래 오류가 이어져 있지 않았다(`__cause__`가 `None`). 4xx 줄에는 `from e`를 붙이고 바로 아래 5xx 줄에서 빠뜨렸다. `from e`가 있어야 나중에 "서버 오류"만 보고도 트레이스백에서 몇 번 오류였는지, 어느 주소였는지 알 수 있다.

완성한 `fetch_current`는 이렇다. (글에서는 변수 이름 오타를 고쳐 적었다)

```python
params = build_params(latitude, longitude)

try:
    r = client.get(API_URL, params=params, timeout=timeout)
    r.raise_for_status()
except httpx.TimeoutException as e:
    raise WeatherError("시간 초과 오류") from e
except httpx.HTTPStatusError as e:
    status_code = e.response.status_code
    if 400 <= status_code < 500:
        raise WeatherError("요청 오류") from e
    raise WeatherError("서버 오류") from e
except httpx.RequestError as e:
    raise WeatherError("연결 실패") from e

try:
    data = r.json()
except ValueError as e:
    raise WeatherError("응답 형식 오류") from e

return parse_current(data)
```

- `build_params`는 `try` 밖에 있다. 위도 오류는 요청을 보내기 **전에** 그대로 나가야 하기 때문이다. 테스트는 이때 가짜 서버에 요청이 한 번도 가지 않았는지까지 확인한다.
- `TimeoutException`을 `RequestError`보다 **먼저** 잡았다. `TimeoutException`은 `RequestError`의 자식이라, 부모를 먼저 쓰면 시간 초과도 거기서 먼저 잡혀 "연결 실패"가 되어 버린다.
- `r.json()`은 본문이 JSON이 아니면(예: 점검 중 HTML 페이지) `ValueError`의 자식인 `JSONDecodeError`를 낸다.

## 결과

```text
uv run pytest week2 -q
71 passed

uv run mypy --strict week2/weather.py
Success: no issues found in 1 source file
```

| 실행 | 출력 | 종료 코드 |
|---|---|---|
| `37.57 126.98` | `2026-11-04T14:15 기온 16.8°C, 바람 5.4km/h` | 0 |
| `999 126.98` | `오류: 위도 범위를 벗어났습니다.` | 2 |
| `abc 1` | 사용법 안내 | 2 |

## 확인 질문 세 개

**① `httpx`가 400에도 예외를 내지 않는 이유**: 요청은 전송됐고 서버의 응답도 받았으니 통신 실패가 아니다. 그래서 `raise_for_status()`로 직접 확인하고, 4xx는 요청 오류, 5xx는 서버 오류로 나눴다.

**② `TimeoutException`을 먼저 쓰는 이유**: `RequestError`의 자식이라서다. 구체적인 자식 예외를 먼저, 넓은 부모 예외를 나중에 쓴다.

**③ `client`를 인자로 받으면 좋은 점**: 가짜 서버를 끼워 인터넷 없이 성공과 실패를 모두 테스트할 수 있다. 실제 실행 환경과 테스트 환경을 나눌 수 있다.

## 배운 점

- **응답을 받았다고 성공이 아니다.** 상태 코드를 확인하고, 200이어도 필요한 키가 있는지 확인한다.
- **실패에는 종류가 있다.** 답이 왔는데 실패한 것과 답을 못 받은 것은 대처가 다르다. 4xx는 다시 보내도 소용없고, 5xx와 연결 실패는 잠시 뒤 다시 하면 될 수 있다.
- **예외는 자식부터 잡는다.**
- **조건문은 값을 넣어 보며 확인한다.** 정상 값, 끝값, 범위 밖 값 세 개면 대부분의 실수가 보인다.
- **바꿔 끼울 틈을 만든다.** 외부와 연결되는 부분은 인자로 받으면 테스트가 쉬워진다.

## 다음에

2주차(Python 중급과 테스트)를 마쳤다. 테스트는 1일차 20개에서 71개가 됐다. 3주차는 Git 협업과 디버깅이다. 브랜치를 만들고, 충돌을 일부러 만들어 해결하고, Pull Request를 해 볼 예정이다.

코드는 [python-basics 저장소](https://github.com/mungonkim/python-basics)에 있다.

만들다가 궁금한 점은 댓글로 남겨주세요.
