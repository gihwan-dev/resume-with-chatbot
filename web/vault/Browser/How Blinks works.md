## Blink가 하는 일

Blink는 웹 렌더링 엔진이다. Blink는 브라우저 탭 내에서 콘텐트를 렌더링하는 것과 관련된 모든것이 구현되어 있다.

- 웹 플랫폼 명세에 대한 구현 (예를 들어, [[HTML Standard]] DOM을 포함한, CSS와 웹 IDL
- V8엔진을 내장하고 자바스크립트를 실행시킨다.
- 주어진 네트워크 스택을 기반으로 리소스를 요청
- DOM 트리 생성
- 크롬 컴포지터를 내장하고 그래픽을 그린다.


**![blink architecture overview](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcTwceLGlhl_tz2-_owU-H8MRqnnP8AI6prCXQ2fREd_ojT-XguynoSpiJ6EtLxzSfXNctP3ahnmppvD9QEvUmbPNTzxbN8Qyqbor7Mqu7U-J0U7169ehS37MdIPR5-WG7oAMzBswh967Z4dpgkCjy6yA?key=Et97q4nHQxscz-mVQ1bXfw)

코드베이스의 관점에서 Blink는 `//third_party/blink/`에 있는 코드들을 의미한다. 프로젝트의 관점에서 Blink는 웹 플랫폼 특성을 구현한 프로젝트를 의미한다.

## 프로세스 / 스레드 아키텍처

### 프로세스

크로미움은 [[멀티 프로세스 아키텍처 (번역)]]를 가진다. 크로미움은 하나의 브라우저 프로세스와 N개의 샌드박스된 렌더러 프로세스를 가진다. Blink는 렌더러 프로세스에서 돌아간다.

얼마나 많은 렌더러 프로세스가 생성될까? 보안상의 이유로, 서로 다른 사이트의 문서들 간에 메모리 주소 영역을 격리해야 한다. 이를 [[사이트 격리]]라고 부른다. 이론적으로 각 렌더러 프로세스는 최대 하나의 사이트만 담당해야 한다.

하지만 현실적으로는 사용자가 너무 많은 탭을 열거나 기기의 RAM이 충분하지 않을 때, 각 렌더러 프로세스를 단일 사이트로 제한하는 것이 부담스러울 수 있다. 이러한 경우 하나의 렌더러 프로세스가 서로 다른 사이트에서 로드된 여러 iframe이나 탭을 공유할 수 있다.

이는 한 탭 안의 iframe들이 서로 다른 렌더러 프로세스에 의해 호스팅될 수 있고, 서로 다른 탭의 iframe 들이 동일한 렌더러 프로세스에 의해 호스팅될 수 있다는 것을 의미한다 결과적으로 **렌더러 프로세스, iframe, 탭 사이에는 1:1 대응 관계가 존재하지 않는다.**

렌더러 프로세스는 샌드박스 환경에서 실행되기 때문에, Blink는 시스템 수준의 작업을 직접 수행할 수 없다. 파일 접근이나 오디오 재생과 같은 시스템 호출, 그리고 쿠키나 비밀번호 같은 사용자 프로필 데이터에 접근하기 위해서는 반드시 브라우저 프로세스에 요청해야 한다.

이러한 브라우저-렌더러 프로세스 간 통신은 Mojo를 통해 이루어진다. 과거에는 크로미움 IPC를 사용했고 아직도 일부에서 사용되고 있지만, 이는 더 이상 권장되지 않으며 내부적으로 Mojo를 사용하도록 변경되었다.

크로미움은 현재 서비스화를 진행 중이다. 브라우저 프로세스의 기능을을 여러 "서비스" 단위로 추상화 하는 작업이다. Blink 관점에서는 이러한 변화 덕분에 단순히 Mojo를 통해 필요한 서비스들과 브라우저 프로세스에 접근할 수 있게 되었다.

**![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXeQsnuZWqGRXcyBzexOEQm6njIYYZVTW8_rQhU2x2_Bjaus0qv_YfYyjxoTnMMNc-iaisXAN90lVFSZRTqkd-iylvXnGKVKhasUdowrYLOyrSXhgtoKGXyFCB_t12IlXw477LLpO0s9Nm8-4LadJbosHA?key=Et97q4nHQxscz-mVQ1bXfw)

### 쓰레드

렌더러 프로세스에서 쓰레드는 얼마나 만들어질까?

Blink는 하나의 메인 쓰레드와 N개의 워커 스레드, 몇 개의 내부 스레드를 가진다.

거의 대부분의 중요한 작업은 메인스레드에서 이뤄진다. 모든 자바스크립트 (워커를 제외한), DOM, CSS, 스타일 및 레이아웃 계산은 메인스레드에서 이뤄진다. Blink는 메인 스레드의 성능을 극대화 하기 위해 최적화 되었다.

Blink는 [[Web Workers]], [[Service Workers]], [[Worklets]]을 실행하기 위해 워커 스레드를 생성할 수 있다.

Blink와 V8은 웹 오디오, 데이터 베이스, GC 등을 다루기 위해 내부 스레드를 생성할 수 있다.

스레드간의 통신을 위해서, PostTask API 기반의 메세지 패싱을 사용해야 한다. 다만 이러한 공유 메모리 프로그래밍은 성능을 위해 꼭 필요한 경우가 아니라면 권장하지 않는다.

**![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcc1r9S3EIpDf5-ygdYcwlEAOz-7GhZWFeHxy55E-fqNPW5EF7bu0KdW5qGV0EVqVsikXZLe4IKexErr7s3-6bM6RZ3T3iMrZqoSUEM6TKXZ0vqm16YLEMjpBflF10QinKk0CAuZk1OJC6LcnrhN_gRk30?key=Et97q4nHQxscz-mVQ1bXfw)

