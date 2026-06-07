# 📚 MyBookShelf — 독서 기록 웹사이트

카카오 도서 검색 API로 책을 검색해 서재에 담고, 별점·한줄평과 함께
**OCR(Tesseract.js)로 추출한 인상깊은 구절**을 카드 형태로 기록하는 개인 독서기록장입니다.

## 핵심 동선
1. **책 검색 & 저장** — 제목/저자 검색 → 카카오 API가 표지·저자·출판사 반환 → 상태(다 읽음/읽는 중/찜)·별점·한줄평 입력해 저장
2. **메인 서재** — 표지 그리드 + 상태별 탭 필터
3. **도서 상세** — 표지 클릭 → 내 감상 카드 + OCR 구절 카드가 한 화면에

## 기술 스택
- **Frontend**: React + Vite, Tailwind CSS, Tesseract.js(OCR), Recharts(차트)
- **Backend**: Node.js + Express, better-sqlite3, Axios, CORS, dotenv
- **인프라**: Nginx 리버스 프록시 + Docker Compose

## 디렉토리 구조
```
MyBookShelf/
├── frontend/          # React + Vite 소스
│   └── src/
│       ├── api/       # 백엔드 호출 (client.js)
│       ├── components/# StarRating, BookCard, OcrUploader
│       ├── hooks/     # useLocalStorage
│       └── pages/     # Library / Search / BookDetail / Stats
├── server/            # Express API
│   ├── server.js      # 진입점
│   ├── db.js          # SQLite 연결 + 스키마
│   └── routes/        # search / books / quotes / stats
├── proxy/             # Nginx 컨테이너 (정적 서빙 + /api 프록시)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── static/dist/   # 빌드된 React (npm run build 결과)
└── docker-compose.yml
```

## 로컬 개발 실행 (도커 없이)

### 1) 백엔드
```bash
cd server
npm install
cp .env.example .env        # KAKAO_API_KEY 채우기
npm run dev                 # http://localhost:3000
```

### 2) 프론트엔드 (다른 터미널)
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
Vite 개발 서버가 `/api` 요청을 자동으로 `:3000`(Express)으로 프록시합니다.

## 도커로 전체 실행

```bash
# 1) 카카오 키 설정
cp .env.example .env        # KAKAO_API_KEY 채우기

# 2) 프론트엔드 빌드 → proxy/static/dist 로 출력
cd frontend && npm install && npm run build && cd ..

# 3) 컨테이너 기동
docker compose up --build
```
→ 브라우저에서 **http://localhost** 접속.

## API 요약
| Method | Endpoint | 기능 |
|--------|----------|------|
| GET | `/api/search?query=` | 카카오 도서 검색 프록시 |
| GET | `/api/books?status=&sort=` | 서재 목록 (상태 필터/정렬) |
| GET | `/api/books/:id` | 도서 상세 (책+감상+구절) |
| POST | `/api/books` | 새 책 등록 |
| PATCH | `/api/books/:id` | 별점·한줄평·상태·기간 수정 |
| DELETE | `/api/books/:id` | 책 삭제 (구절 CASCADE) |
| GET | `/api/books/:id/quotes` | 구절 목록 |
| POST | `/api/books/:id/quotes` | OCR 구절 저장 |
| DELETE | `/api/quotes/:id` | 구절 삭제 |
| GET | `/api/stats` | 통계 집계 |

## 데이터 저장 전략
- **SQLite**: 영구 보존 데이터 (`books`, `quotes` — 1:N)
- **localStorage**: 선택 탭, 그리드 보기 개수, 최근 검색어, OCR 임시 추출 텍스트(자동 복구)

## 커스터마이징 포인트
- 색상: `frontend/tailwind.config.js` 의 `shelf` 팔레트
- 상태 라벨/색: `frontend/src/api/client.js` 의 `STATUS`
- 스키마: `server/db.js`
