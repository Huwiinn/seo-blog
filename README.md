# SEO Blog

개인 SEO 지식 베이스를 위한 Next.js 블로그 프로젝트입니다.  
테크니컬 SEO, 콘텐츠 SEO, 마케팅 용어, GA4, 개인 학습 로그를 카테고리 기반으로 정리하는 구조로 구성되어 있습니다.

URL: https://www.seo-blog.site

## Overview

- 목적: SEO 실무 지식과 학습 내용을 지속적으로 축적하는 개인 블로그
- 현재 구성: 홈 랜딩 페이지, 상단 헤더 네비게이션, 카테고리별 아카이브형 페이지
- 디자인 방향: 밝은 베이스 배경 + 따뜻한 포인트 컬러 기반의 정보 중심 레이아웃
- 테크니컬 SEO, 콘텐츠 SEO 등 실무 테스트를 진행

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Project Structure

```text
app/
  layout.tsx              # 전역 레이아웃 (헤더, 푸터, 메타데이터)
  page.tsx                # 홈 화면
  globals.css             # 전역 스타일
  site-data.ts            # 네비게이션, 카테고리, 샘플 포스트 데이터
  category-template.tsx   # 카테고리 공통 템플릿
  technical-seo/page.tsx  # 테크니컬 SEO
  content-seo/page.tsx    # 콘텐츠 SEO
  marketing-terms/page.tsx# 마케팅 용어
  ga/page.tsx             # GA
  learning-log/page.tsx   # 개인 학습
```

## Routes

- `/` : 홈
- `/technical-seo` : 테크니컬 SEO
- `/content-seo` : 콘텐츠 SEO
- `/marketing-terms` : 마케팅 용어
- `/ga` : GA
- `/learning-log` : 개인 학습

## Design Tokens

- Main color: `#C86A3B`
- Sub color: `#F5DCC7`
- Background: `#F7F3EA`
- Foreground: `#182126`
- Muted text: `#586168`

## Next Steps

- 실제 포스트 데이터 소스 연결 (MDX, Markdown, CMS 등)
- 글 상세 페이지 추가
- 검색/태그/목차 기능 확장
- favicon 및 Open Graph 메타데이터 정리
