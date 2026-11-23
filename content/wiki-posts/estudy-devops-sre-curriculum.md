---
source: 개발/rlaope-estudy/devops-sre-os-network-curriculum.md
slug: estudy-devops-sre-curriculum
category: dev
title: DevOps·SRE 커리큘럼: estudy 노트 316개 정리
metaTitle: DevOps·SRE 커리큘럼 정리
summary: estudy의 DevOps·SRE 커리큘럼은 홈페이지 여섯 그룹, 노트 316개입니다. 컨테이너와 클라우드 인프라, 장애 대응 50문답, 네트워크와 운영체제 기초를 다룹니다. 운영체제와 네트워크를 먼저 읽고 DevOps 노트를 거쳐 SRE 50문답으로 점검하는 순서를 권합니다.
metaDescription: DevOps·SRE 커리큘럼을 estudy 노트 316개 기준으로 그룹별 주제 표, 50문답 분류, 추천 학습 순서로 정리했습니다.
focusKeyword: SRE 커리큘럼
tags: [estudy, DevOps, SRE, Kubernetes, 네트워크]
---

estudy의 DevOps·SRE 커리큘럼은 2026년 11월 기준 316개 노트입니다. 컨테이너와 클라우드 인프라, 실전 장애 대응 50문답, 네트워크와 운영체제 기초를 한 갈래로 묶었습니다. 운영체제와 네트워크를 먼저 읽고 DevOps 노트를 거쳐 사이트 신뢰성 엔지니어링(SRE) 50문답으로 점검하는 순서를 권합니다.

estudy는 개발자 rlaope가 공개한 학습 사이트입니다. 이 글은 [SRE 섹션](https://rlaope.github.io/SRE/index.html)과 인프라 관련 그룹의 주제별 편수와 읽는 순서를 안내합니다. 사이트 전체 구성은 [estudy 지식 베이스 소개 글](/posts/estudy-knowledge-base-overview)에 있습니다.

## DevOps·SRE 커리큘럼은 무엇을 다루나요?

홈페이지 색인의 여섯 그룹, 노트 316개입니다. DevOps가 114개로 가장 많고 Network 85개, SRE 51개가 뒤를 잇습니다.

| 그룹 | 노트 수 | 핵심 주제 |
| --- | --- | --- |
| Essentials | 8 | 성장 철학, 인지 부하, AI 시대 학습 전략 |
| DevOps | 114 | Docker, Kubernetes, AWS와 코드형 인프라(IaC), 로그 모니터링 |
| SRE | 51 | 실전 장애 대응 50문답, Parallel GC Hang 알림 |
| Network | 85 | HTTP 표준, L2~L7과 보안, TCP 혼잡 제어 |
| Operating System | 35 | 가상 메모리, NUMA, 하드웨어 동시성, 락프리 |
| Data Structure | 23 | 자료구조, 자가 균형 탐색 트리, 그래프 알고리즘 |

### Essentials 8개: 성장과 학습 태도

Essentials 그룹은 기술보다 성장 방식을 다룹니다. 노트는 번아웃의 원인을 소프트웨어 분야의 큰 인지 부하에서 찾습니다. 그래서 여러 주제를 한꺼번에 공부하지 않고 핵심 원리를 쪼개어 쌓는 방식을 소개합니다.

AI 시대의 학습 전략도 다룹니다. 컴파일러가 등장했을 때 개발자가 사라지지 않았듯 AI도 도구라는 관점입니다. YAGNI와 애자일 같은 실용 원칙도 이 그룹에 있습니다.

## DevOps 그룹: 컨테이너에서 로그 모니터링까지

DevOps 그룹 114개는 Docker, Kubernetes, AWS와 IaC를 다룹니다. 마이크로서비스 로그 모니터링 구성을 정리한 노트도 있습니다.

| 묶음 | 편수 | 주요 주제 |
| --- | --- | --- |
| Docker | 17 | VM과 컨테이너 비교, Docker 엔진, runc와 리눅스 네임스페이스, 리소스 제한 |
| Kubernetes | 30 | Desired State 모델, Pod 생명주기, 프로브, Cluster Autoscaler와 Karpenter, RBAC |
| AWS와 IaC | 40 이상 | VPC와 NAT Gateway, Aurora, EKS, SQS, Terraform |

로그 모니터링 노트는 Kubernetes 환경의 구성을 제시합니다. Promtail DaemonSet이 컨테이너 로그를 수집해 `namespace`, `app`, `pod` 같은 라벨을 붙입니다. 라벨이 붙은 로그는 Loki에 색인합니다. Grafana 대시보드에서는 서비스별 로그만 바로 걸러 봅니다.

## SRE 50문답은 무엇을 묻나요?

SRE 그룹에는 프로덕션 환경에서 나오는 질문 50개와 Parallel GC Hang 알림 노트가 있습니다. 질문을 주제별로 묶으면 다섯 영역입니다.

| 영역 | 문항 | 대표 주제 |
| --- | --- | --- |
| Kubernetes 운영과 네트워킹 | `q_1`~`q_15` | Pod Pending 원인, kube-proxy, HPA와 VPA 리스크, CrashLoopBackOff |
| Linux 커널과 시스템 자원 | `q_16`~`q_25` | OOM Killer 점수 산정, Load Average 해석, cgroup, FD 고갈 |
| 관측성과 메트릭 설계 | `q_26`~`q_33` | Prometheus Pull 모델, p95와 p99 차이, High Cardinality, SLO와 SLI |
| 네트워크와 미들웨어 장애 | `q_34`~`q_40` | MTU 불일치, 커넥션 풀 고갈, Nginx 502와 504, GC Pause 증가 |
| 장애 대응과 배포, 에러 버짓(Error Budget) | `q_41`~`q_50` | 심각도 산정, 롤백 전략, Blue/Green과 Canary, 포스트모템 |

마지막 영역은 탐지에서 분류와 완화를 거쳐 근본 원인 분석(RCA)에 이르는 대응 흐름을 묻습니다. 알림 피로를 줄이는 방법, SLA와 에러 버짓도 여기서 다룹니다.

## Network, Operating System, Data Structure 그룹

세 그룹은 프로토콜, 커널, 알고리즘의 기초를 다룹니다. 50문답에 나오는 NUMA 지연이나 TCP 관련 문항의 배경 지식이 여기에 있습니다.

### Network (85개)

- **웹과 HTTP 표준(28편)**: 브라우저 요청 흐름, 메서드의 멱등성과 안전성을 다룹니다. `ETag`와 `Last-Modified` 조건부 캐시 검증도 있습니다.
- **L2~L7과 보안(30편 이상)**: VLAN과 BGP 피어링, TLS 핸드셰이크, SYN Cookie를 다룹니다.
- **TCP와 혼잡 제어(25편 이상)**: TCP 상태기계를 다룹니다. 손실 기반 알고리즘(Reno, CUBIC)에서 대역폭·지연 기반의 BBR과 QUIC으로 넘어온 배경도 분석합니다.

### Operating System (35개)

메모리 노트는 페이징과 페이지 교체, MMU와 TLB, NUMA와 쓰기 시 복사(Copy-on-Write)를 다룹니다. 동시성 노트는 CPU의 비순차 실행(Out-of-Order Execution)과 메모리 배리어를 다룹니다. CAS와 ABA 문제, 락프리 자료구조도 여기에 있습니다.

### Data Structure (23개)

선형 리스트와 스택, 큐 같은 기본 구조와 자가 균형 탐색 트리(AVL, Red-Black, B-Tree)를 다룹니다. 그래프 노트는 DFS와 BFS 탐색, 최소 신장 트리, 최단 경로 알고리즘을 정리합니다.

## 어떤 순서로 공부하면 좋을까요?

Essentials로 가볍게 시작해 운영체제와 네트워크로 기초를 다지고, DevOps를 읽은 뒤 SRE 50문답으로 점검하는 순서를 권합니다. 사이트가 정한 순서는 아니며, 뒤 단계의 전제가 되는 주제를 앞에 두었습니다.

1. **Essentials 8개**: 분량이 적고 학습 방식을 다루므로 먼저 읽습니다.
2. **Operating System과 Network**: 가상 메모리와 TCP 상태기계처럼 뒤 단계의 전제가 되는 개념을 잡습니다.
3. **DevOps**: Docker, Kubernetes, AWS와 IaC, 로그 모니터링 순으로 읽습니다.
4. **SRE 50문답**: 영역별로 답을 먼저 적어 본 뒤 노트와 대조합니다.
5. **Data Structure**: 다른 단계와 나란히 조금씩 읽습니다.

50문답의 GC Pause 문항과 Parallel GC Hang 노트는 [백엔드 커리큘럼 글](/posts/estudy-backend-msa-curriculum)의 JVM 부분과 함께 읽기를 권합니다. 이 갈래의 3주차 복습 계획은 [estudy 실습 가이드](/posts/estudy-hands-on-lab-guide)의 4주 진도표에 있습니다.
