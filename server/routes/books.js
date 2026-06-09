// ./api/books 관련 라우트 + 책에 속한 구절 조회/추가
import { Router } from 'express';
import db from '../db.js';

const router = Router();

// 책 한 권 + 구절 목록을 함께 반환하기 위한 헬퍼
function getBookWithQuotes(id) {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!book) return null;
  book.quotes = db
    .prepare('SELECT * FROM quotes WHERE book_id = ? ORDER BY created_at DESC')
    .all(id);
  return book;
}

// GET /api/books 서재 목록 조회
router.get('/', (req, res) => {
  const { status, sort } = req.query;
  const where = [];
  const params = [];
  if (status && ['done', 'reading', 'wish'].includes(status)) {
    where.push('status = ?');
    params.push(status);
  }
  const orderBy = sort === 'rating' ? 'rating DESC, created_at DESC' : 'created_at DESC';
  const sql = `SELECT * FROM books ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderBy}`;
  res.json({ books: db.prepare(sql).all(...params) });
});

// GET /api/books/:id 책 한 권 조회
router.get('/:id', (req, res) => {
  const book = getBookWithQuotes(req.params.id);
  if (!book) return res.status(404).json({ error: '책을 찾을 수 없습니다.' });
  res.json({ book });
});

// POST /api/books  새 책 등록 (검색 결과 + 사용자 입력)
router.post('/', (req, res) => {
  const {
    isbn, title, author, publisher, cover_url,
    status = 'wish', rating = 0, review = '', read_start = null, read_end = null,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title 은 필수입니다.' });

  const stmt = db.prepare(`
    INSERT INTO books (isbn, title, author, publisher, cover_url, status, rating, review, read_start, read_end)
    VALUES (@isbn, @title, @author, @publisher, @cover_url, @status, @rating, @review, @read_start, @read_end)
  `);
  const info = stmt.run({ isbn, title, author, publisher, cover_url, status, rating, review, read_start, read_end });
  res.status(201).json({ book: getBookWithQuotes(info.lastInsertRowid) });
});

// PATCH /api/books/:id   책 정보 수정 (별점/한줄평/상태/읽은 기간)
router.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '책을 찾을 수 없습니다.' });

  // 전달된 필드만 골라서 업데이트
  const allowed = ['status', 'rating', 'review', 'read_start', 'read_end'];
  const updates = allowed.filter((k) => k in req.body);
  if (updates.length === 0) return res.json({ book: getBookWithQuotes(existing.id) });

  const setClause = updates.map((k) => `${k} = @${k}`).join(', ');
  const payload = Object.fromEntries(updates.map((k) => [k, req.body[k]]));
  db.prepare(`UPDATE books SET ${setClause} WHERE id = @id`).run({ ...payload, id: existing.id });
  res.json({ book: getBookWithQuotes(existing.id) });
});

// DELETE /api/books/:id   책 삭제 (구절은 FK CASCADE로 함께 삭제)
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: '책을 찾을 수 없습니다.' });
  res.json({ ok: true });
});

// GET /api/books/:id/quotes   특정 책의 구절 목록
router.get('/:id/quotes', (req, res) => {
  const quotes = db
    .prepare('SELECT * FROM quotes WHERE book_id = ? ORDER BY created_at DESC')
    .all(req.params.id);
  res.json({ quotes });
});

// POST /api/books/:id/quotes   OCR로 추출된 구절 저장
router.post('/:id/quotes', (req, res) => {
  const book = db.prepare('SELECT id FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ error: '책을 찾을 수 없습니다.' });

  const { quote_text, page_no = null } = req.body;
  if (!quote_text || !quote_text.trim()) {
    return res.status(400).json({ error: 'quote_text 는 필수입니다.' });
  }
  const info = db
    .prepare('INSERT INTO quotes (book_id, quote_text, page_no) VALUES (?, ?, ?)')
    .run(book.id, quote_text.trim(), page_no);
  res.status(201).json({ quote: db.prepare('SELECT * FROM quotes WHERE id = ?').get(info.lastInsertRowid) });
});

export default router;
