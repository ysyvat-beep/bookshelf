// Express 진입점 — 라우터를 한 곳에서 모아 마운트합니다.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import searchRouter from './routes/search.js';
import booksRouter from './routes/books.js';
import quotesRouter from './routes/quotes.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());                       // 개발 중 프론트(다른 포트)에서 호출 허용
app.use(express.json({ limit: '2mb' })); // OCR 텍스트가 길 수 있어 여유를 둠

// 헬스 체크
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// 라우터 마운트 (과제 API 설계 표 기준)
app.use('/api/search', searchRouter); // GET  /api/search?query=
app.use('/api/books', booksRouter);   // GET/POST/PATCH/DELETE /api/books, /api/books/:id, /api/books/:id/quotes
app.use('/api/quotes', quotesRouter); // DELETE /api/quotes/:id
app.use('/api/stats', statsRouter);   // GET  /api/stats

// 공통 에러 핸들러
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || '서버 오류' });
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
});
