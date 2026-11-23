---
source: 개발/rlaope-estudy/README.md
slug: estudy-knowledge-base-overview
category: dev
title: estudy 지식 베이스: 913개 노트 구성과 읽는 순서
metaTitle: estudy 지식 베이스 구성 정리
summary: estudy는 개발자 rlaope가 공개한 학습 사이트입니다. 노트 913개가 16개 주제 그룹으로 나뉘며, 백엔드, DevOps·SRE, AI 세 갈래로 묶어 읽을 수 있습니다. 업무와 가까운 갈래부터 읽고 지식 그래프로 범위를 넓히기를 권합니다.
metaDescription: estudy의 노트 913개와 16개 주제 그룹을 세 갈래로 묶고, 어디서부터 읽으면 좋은지 순서를 정리했습니다.
focusKeyword: estudy
tags: [estudy, 개발자 학습 자료, 지식 그래프, 커리큘럼]
---

estudy는 개발자 rlaope가 공개한 학습 사이트입니다. 2026년 11월 기준 노트는 913개이고, 홈페이지 색인은 16개 주제 그룹으로 나뉩니다. 양이 많으므로 백엔드, DevOps·SRE, AI 세 갈래 가운데 업무와 가까운 쪽부터 읽기를 권합니다.

이 글은 [estudy(rlaope.github.io)](https://rlaope.github.io/)의 규모와 주제 그룹, 읽는 순서를 소개합니다.

## estudy는 어떤 학습 사이트인가요?

estudy는 소프트웨어 공학과 AI 엔지니어링을 다루는 개인 디지털 가든(digital garden)입니다. 컴퓨터 공학 기초에서 분산 백엔드와 인프라 운영, 대규모 언어 모델(LLM) 서빙과 강화학습까지 한 사이트에서 다룹니다. 이론과 실무 의사결정을 잇는 학습 기록이 중심입니다.

노트는 영문과 국문으로 제공합니다. 국문 노트는 `/ko/` 경로의 한국어 미러에 있습니다.

화면은 두 가지입니다. 읽기 페이지는 Hugo 0.166.0이 생성한 정적 HTML이며 JavaScript 번들을 싣지 않습니다. 지식 그래프 페이지(`/graph.html`)는 Rust로 만든 WebAssembly와 Canvas 2D로 노트 사이의 연결을 그립니다.

## 규모: 노트 913개와 그래프 노드 932개

노트는 913개, 주제 그룹은 16개, 지식 그래프의 노드는 932개입니다. 그래프 노드에는 색인 페이지와 허브 노드도 들어 있어 노트 수보다 많습니다.

## 16개 주제 그룹은 어떻게 나뉘나요?

16개 그룹은 백엔드, DevOps·SRE, AI 세 갈래로 묶을 수 있습니다. 백엔드와 DevOps·SRE가 6개 그룹씩이고 AI가 4개 그룹입니다. 표의 마지막 열은 그 그룹이 속한 갈래입니다.

| 그룹 | 노트 수 | 주요 범위 | 갈래 |
| --- | --- | --- | --- |
| Essentials | 8 | 엔지니어 성장, YAGNI, 애자일, AI 시대 학습 전략 | DevOps·SRE |
| Server | 103 | Netty 내부 구조, Kafka, WAL과 합의, 이중 캐시 | 백엔드 |
| DevOps | 114 | Docker, Kubernetes, AWS, Terraform, Loki 모니터링 | DevOps·SRE |
| SRE | 51 | 관측성, 실전 장애 대응 50문답, Parallel GC Hang 알림 | DevOps·SRE |
| Languages | 166 | Java와 ZGC 내부, Kotlin 코루틴, Go, JS·TS·React | 백엔드 |
| Frameworks | 93 | Spring MVC와 WebFlux, Batch, HikariCP, JPA | 백엔드 |
| Domain Driven Design | 11 | Bounded Context, Aggregate, 도메인 이벤트, CQRS | 백엔드 |
| DataBase | 79 | RDB 정규화와 SQL, MongoDB, Redis, B+Tree와 LSM | 백엔드 |
| Design Pattern | 22 | GoF 패턴 가운데 생성 5종, 행동 11종, 구조 6종 | 백엔드 |
| Network | 85 | HTTP 캐시, TLS 핸드셰이크, TCP 상태기계, BBR과 QUIC | DevOps·SRE |
| Operating System | 35 | 가상 메모리, NUMA, 비순차 실행, 쓰기 시 복사, CAS | DevOps·SRE |
| Data Structure | 23 | 선형·비선형 자료구조, AVL과 Red-Black, 최단 경로 | DevOps·SRE |
| AI | 85 | LLM 게이트웨이, vLLM, LangGraph, 오픈웨이트 모델 분석 | AI |
| AI/MLOps | 23 | HBM과 루프라인 모델, NVLink, NCCL, SGLang 서빙 | AI |
| Mathematics | 7 | 연립일차방정식, 가우스-조르당 소거법, 고윳값, 행렬 분해 | AI |
| 색인 미등록 | 9 | 하위 디렉터리 README 5편, Git 기초, InfiniBand 등 | AI |

색인 미등록(Not in index)은 색인에 오르지 않은 노트 9개를 따로 묶은 항목입니다. 그룹별 수는 홈페이지 색인에 걸린 링크 기준이어서 합계가 914개이고, 노트 913개보다 하나 많습니다. 갈래별로 더하면 백엔드 474개, DevOps·SRE 316개, AI 124개입니다.

## 이어서 읽을 다섯 편의 글

커리큘럼 글 세 편은 갈래별 노트 구성과 학습 순서를, 나머지 두 편은 화면 구성과 복습 방법을 다룹니다.

- [백엔드 커리큘럼 글](/posts/estudy-backend-msa-curriculum): 서버 아키텍처, JVM, 데이터베이스
- [DevOps·SRE 커리큘럼 글](/posts/estudy-devops-sre-curriculum): 컨테이너 인프라, 장애 대응 50문답, 네트워크와 운영체제
- [AI 엔지니어링 커리큘럼 글](/posts/estudy-ai-mlops-curriculum): LLM 게이트웨이, GPU 서빙, 강화학습
- [지식 그래프 UI 분석 글](/posts/estudy-knowledge-graph-ui): 지식 그래프 화면과 디자인 토큰
- [estudy 실습 가이드](/posts/estudy-hands-on-lab-guide): 읽은 내용을 랩 주제와 회상 문제로 복습하는 방법

## 어디서부터 읽으면 좋을까요?

지금 하는 일과 가까운 갈래 하나를 골라, 그 커리큘럼 글이 제안하는 순서대로 읽기를 권합니다. 913개를 처음부터 끝까지 읽는 방식은 권하지 않습니다.

1. 갈래를 고릅니다. 백엔드, DevOps·SRE, AI 가운데 업무와 가장 가까운 쪽입니다.
2. Essentials 8개를 먼저 읽습니다. 기술 주제에 앞서 학습 방식을 다루는 그룹입니다.
3. 고른 갈래의 커리큘럼 글에서 그룹별 노트 수와 추천 순서를 확인합니다.
4. 사이트에서 노트를 읽습니다. 국문이 편하면 한국어 미러를 씁니다.
5. 지식 그래프에서 방금 읽은 노트와 연결된 이웃 노트를 찾아 범위를 넓힙니다.
6. 읽은 내용을 점검합니다. 실습 가이드의 랩 표를 질문으로 바꿔 답해 봅니다.

## 자주 묻는 질문

### estudy는 한국어로 읽을 수 있나요?

읽을 수 있습니다. 사이트는 노트를 영문과 국문으로 제공하며, 국문 노트는 `/ko/` 경로의 한국어 미러에 있습니다.

### 노트를 전부 읽어야 하나요?

전부 읽지 않아도 됩니다. 업무와 가까운 갈래 하나를 골라 그 갈래의 그룹부터 읽고, 지식 그래프로 이웃 노트를 찾아 범위를 넓히면 됩니다.
