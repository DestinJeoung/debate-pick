# Debate Pick (토론 플랫폼 MVP)

이 프로젝트는 Antigravity Agent에 의해 생성된 Next.js 기반 토론 플랫폼 초안입니다.

## 시작하기 (Getting Started)

Node.js 환경이 필요합니다.

### 1. 패키지 설치
```bash
npm install
```

### 2. 데이터베이스 설정 (SQLite)
Prisma를 사용하여 데이터베이스 스키마를 동기화합니다.
```bash
npx prisma db push
```

### 3. 초기 데이터 주입 (Seeding)
테스트용 데이터를 생성합니다.
```bash
npx prisma db seed
# 또는
ts-node prisma/seed.ts
```
(package.json의 prisma seed 설정이 필요할 수 있습니다. `npx prisma db seed`가 실패하면 `npm install -D ts-node` 설치 후 `npx ts-node prisma/seed.ts`를 실행하세요.)

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인하세요.

## 구조
- `app/page.tsx`: 메인 페이지 (토론 주제 리스트)
- `app/topics/[id]`: 상세 페이지 (투표 및 토론)
- `prisma/schema.prisma`: 데이터베이스 모델 (Users, Topics, Opinions)
