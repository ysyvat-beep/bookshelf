// SQLite 연결 + 스키마 초기화
// better-sqlite3 는 동기 API라 코드가 간결해집니다.
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, 'bookshelf.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // 동시 읽기 성능 향상
db.pragma('foreign_keys = ON');  // FK 제약 활성화

// SQLite 스키마 설계
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn       TEXT,                       -- 도서 식별
    title      TEXT NOT NULL,              -- 제목 (카카오 API)
    author     TEXT,                       -- 저자 (카카오 API)
    publisher  TEXT,                       -- 출판사 (카카오 API)
    cover_url  TEXT,                        -- 표지 썸네일 URL (카카오 API)
    status     TEXT NOT NULL DEFAULT 'wish' CHECK (status IN ('done','reading','wish')),
    rating     INTEGER CHECK (rating BETWEEN 0 AND 5), -- 별점 1~5 (0=미입력)
    review     TEXT,                       -- 한줄평
    read_start TEXT,                       -- 읽기 시작일 (YYYY-MM-DD)
    read_end   TEXT,                       -- 완독일 (YYYY-MM-DD)
    created_at TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id    INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,              -- OCR로 추출된 구절 본문
    page_no    INTEGER,                    -- (선택) 페이지 번호
    created_at TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
  );

  CREATE INDEX IF NOT EXISTS idx_quotes_book ON quotes(book_id);
`);

export default db;
