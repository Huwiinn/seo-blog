---
source: 개발/rlaope-estudy/backend-msa-database-curriculum.md
slug: estudy-backend-msa-curriculum
category: dev
title: 백엔드 커리큘럼: estudy 노트 474개 정리
metaTitle: 백엔드 커리큘럼 474개 노트 정리
summary: estudy의 백엔드 커리큘럼은 홈페이지 여섯 그룹, 노트 474개입니다. 서버 아키텍처와 JVM, 프레임워크, 데이터베이스를 다룹니다. Server에서 시작해 DataBase와 JVM을 읽고 Frameworks와 설계 주제로 마무리하는 순서를 권합니다.
metaDescription: 백엔드 커리큘럼을 estudy 노트 474개 기준으로 여섯 그룹의 핵심 주제 표와 추천 학습 순서로 나눠 정리했습니다.
focusKeyword: 백엔드 커리큘럼
tags: [estudy, 백엔드, MSA, JVM, 데이터베이스]
---

estudy의 백엔드 커리큘럼은 2026년 11월 기준 474개 노트로, 사이트에서 비중이 가장 큰 영역입니다. 서버 아키텍처에서 JVM, 데이터베이스까지 여섯 그룹으로 나뉩니다. Server에서 시작해 DataBase와 JVM을 읽고, Frameworks와 설계 주제로 마무리하는 순서를 권합니다.

estudy는 개발자 rlaope가 공개한 학습 사이트입니다. 이 글은 [백엔드 섹션](https://rlaope.github.io/Back-End/index.html)의 주제별 편수와 읽는 순서를 안내합니다. 사이트 전체 구성은 [estudy 지식 베이스 소개 글](/posts/estudy-knowledge-base-overview)에 있습니다.

## 백엔드 커리큘럼은 무엇을 다루나요?

홈페이지 색인의 여섯 그룹, 노트 474개입니다. Languages가 166개로 가장 많고 Server 103개, Frameworks 93개가 뒤를 잇습니다.

| 그룹 | 노트 수 | 핵심 주제 |
| --- | --- | --- |
| Server | 103 | Netty 내부 구조, Kafka, 분산 일관성과 MSA, 이중 캐시 |
| Languages | 166 | HotSpot JVM과 ZGC, Kotlin, Go, 웹 프론트엔드 |
| Frameworks | 93 | Spring 생태계, JPA와 Hibernate |
| Domain Driven Design | 11 | Bounded Context, Aggregate, 도메인 이벤트, CQRS |
| DataBase | 79 | RDB와 SQL, 인덱싱과 스토리지 엔진, NoSQL |
| Design Pattern | 22 | GoF 생성, 행동, 구조 패턴 |

## Server 그룹: Netty, Kafka, 분산 시스템

Server 그룹 103개는 네트워크 프레임워크 내부, 메시징, 분산 일관성과 캐시 설계를 다룹니다.

### Netty 내부 구조 (10편)

이벤트 루프가 채널별 I/O 이벤트를 스레드 하나에 맡겨 컨텍스트 스위칭과 락 경합을 없애는 구조를 설명합니다. I/O 모델에서는 `NioEventLoop`와 리눅스의 `EpollEventLoop`를 비교합니다. ByteBuf 다이렉트 메모리 풀링과 배압(backpressure) 기반 비동기 흐름 제어도 다룹니다.

### Kafka와 메시징 (14편)

Producer, Partition, Broker 같은 구성요소에서 복제와 ISR(In-Sync Replica)까지 구조를 하나씩 설명합니다. 파티션 할당 전략에서는 Eager와 Cooperative 리밸런싱(rebalancing)을 비교하고 수동 오프셋 커밋을 정리합니다. 리밸런싱 도중 생기는 중복 메시지를 처리하는 멱등성(idempotency) 보장 패턴도 있습니다.

### 분산 일관성, MSA, 이중 캐시 (40편 이상)

Server 그룹에서 가장 큰 묶음이며 주제는 셋입니다.

- **복제와 합의**: 데이터를 반영하기 전에 연산 로그를 순차 기록하는 WAL(Write-Ahead Log)에서 출발합니다. Lamport Clock과 Vector Clock, 리더 선출, Paxos와 Raft로 이어집니다.
- **트랜잭션과 서비스 메시**: 2단계 커밋(2PC)의 한계를 넘는 패턴을 정리합니다. Saga, Event Sourcing과 CQRS, Transactional Outbox가 대상입니다. Istio와 Envoy의 내부 구조, mTLS, 서킷 브레이커도 다룹니다.
- **이중 캐시**: 애플리케이션 힙의 L1 로컬 캐시와 L2 Redis를 함께 쓰는 설계입니다. 핫 키가 만료되면 DB로 요청이 한꺼번에 몰리는 캐시 스탬피드(Cache Stampede)가 생깁니다. 사이트는 스탬피드를 막는 방법으로 분산락과 PER(Probabilistic Early Recomputation)을 제시합니다.

## Languages 그룹: JVM 내부와 Generational ZGC

Languages 그룹 166개 가운데 88편이 HotSpot JVM과 Java 21의 Generational ZGC를 다룹니다. 나머지 78편은 Kotlin 37편, Go 4편, 웹 프론트엔드 37편입니다.

JVM 노트는 세 층으로 나뉩니다.

- **객체와 메모리 할당**: 객체 헤더의 Mark Word, 할당 버퍼인 TLAB과 PLAB, 네이티브 메모리 단편화를 분석합니다.
- **Generational ZGC**: 기존 Load Barrier에 세대를 구분하는 Store Barrier가 더해졌다고 설명합니다. 포인터의 색상 비트가 정상이면 빠르게 통과하고, 맞지 않으면 느린 경로(Slow Path)로 들어가 포인터를 스스로 고칩니다.
- **Safepoint와 JIT 최적화**: OS 페이지 폴트를 이용한 Safepoint 폴링을 설명합니다. Devirtualization 같은 JIT 최적화와 GraalVM Native Image의 메모리 최적화도 다룹니다.

Kotlin 노트는 스코프 함수와 시퀀스 지연 평가, 코루틴, Kotest를 다룹니다. `kapt`와 Lombok이 호환되지 않는 이유를 다룬 노트도 있습니다. 웹 노트는 JS 프로토타입과 Promise, TypeScript 제네릭, React 컴포넌트를 정리합니다.

## Frameworks와 Domain Driven Design

Frameworks 그룹 93개는 Spring 생태계 57편과 JPA·Hibernate 19편이 중심입니다. Domain Driven Design 그룹 11개는 도메인 경계와 이벤트 설계를 다룹니다.

| 묶음 | 편수 | 주요 주제 |
| --- | --- | --- |
| Spring 생태계 | 57 | IoC/DI 컨테이너, AOP와 `@Transactional`, HikariCP, Spring Batch, WebFlux와 R2DBC |
| JPA·Hibernate | 19 | 영속성 컨텍스트와 Flush, N+1과 Fetch Join, 트랜잭션 전파, 프록시 지연 로딩, OSIV |
| Domain Driven Design | 11 | Bounded Context, Aggregate 경계, 도메인 서비스, 도메인 이벤트, CQRS |

## DataBase와 Design Pattern

DataBase 그룹 79개는 네 하위 영역으로 나뉩니다. RDB 이론과 SQL 실습이 29편으로 가장 많습니다.

| 하위 영역 | 편수 | 주요 항목 |
| --- | --- | --- |
| RDB 이론과 SQL 실습 | 29 | 정규화와 반정규화, ACID, CAP, 실행 계획 옵티마이저, 윈도우·계층형 질의 |
| 인덱싱과 스토리지 엔진 | 21 | B+Tree와 LSM Tree, 커버링 인덱스, InnoDB 잠금, MySQL WAL |
| NoSQL(MongoDB, Redis) | 19 | MongoDB 샤딩, Redis 메모리 단편화 비율, RedLock, Lua 원자성 |
| 부하 분산과 시계열 | 10 | 파티셔닝, 샤딩, 복제와 클러스터링, InfluxDB |

Design Pattern 그룹 22개는 GoF 패턴 가운데 생성 5종, 행동 11종, 구조 6종을 다룹니다. 노트는 패턴을 배우는 이유로 재사용, 협업 어휘, 바퀴 재발명 방지를 듭니다.

## 어떤 순서로 공부하면 좋을까요?

Server에서 시작해 DataBase와 JVM을 읽고, Frameworks와 설계 주제로 마무리하는 순서를 권합니다. 사이트가 정한 순서는 아니며, 주제가 겹치는 지점을 따랐습니다.

1. **Server**: Netty, Kafka, 분산 일관성과 이중 캐시 순으로 읽습니다.
2. **DataBase**: 인덱싱과 스토리지 엔진, Redis 노트부터 봅니다. 1단계에서 본 WAL과 분산락이 다시 나옵니다.
3. **Languages의 JVM**: 객체와 메모리 할당, Generational ZGC, Safepoint 순으로 읽습니다.
4. **Frameworks**: Spring을 먼저 읽고 JPA로 넘어갑니다.
5. **Domain Driven Design과 Design Pattern**: 분량이 적어 앞 단계와 나란히 읽습니다. CQRS는 1단계의 MSA 노트와 겹칩니다.

Spring과 JPA를 매일 쓴다면 4단계를 맨 앞으로 옮겨도 됩니다. 이중 캐시와 ZGC에서 확인할 동작은 [estudy 실습 가이드](/posts/estudy-hands-on-lab-guide)의 랩 표에 정리했습니다. 운영체제와 네트워크 기초가 필요하면 [DevOps·SRE 커리큘럼 글](/posts/estudy-devops-sre-curriculum)을 함께 읽기를 권합니다.
