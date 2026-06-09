// GET /api/stats   독서 통계 집계 (대시보드용)
// SQL 집계(GROUP BY / COUNT / AVG)를 활용

import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  // 1) 상태별 권수
  const byStatus = db
    .prepare(`SELECT status, COUNT(*) AS count FROM books GROUP BY status`)
    .all();

  // 2) 월별 완독 권수 (read_end 기준, 최근 12개월 정도)
  const monthly = db
    .prepare(`
      SELECT substr(read_end, 1, 7) AS month, COUNT(*) AS count
      FROM books
      WHERE read_end IS NOT NULL AND read_end <> ''
      GROUP BY month
      ORDER BY month
    `)
    .all();

  // 3) 평균 별점 (별점 입력된 책만)
  const ratingRow = db
    .prepare(`SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS rated_count
              FROM books WHERE rating > 0`)
    .get();

  // 4) 별점 분포 (1~5)
  const ratingDist = db
    .prepare(`SELECT rating, COUNT(*) AS count FROM books WHERE rating > 0 GROUP BY rating ORDER BY rating`)
    .all();

  // 5) 전체 요약
  const totals = db
    .prepare(`SELECT
        (SELECT COUNT(*) FROM books)  AS total_books,
        (SELECT COUNT(*) FROM quotes) AS total_quotes`)
    .get();

  res.json({
    totals,
    byStatus,
    monthly,
    avgRating: ratingRow.avg_rating ?? 0,
    ratedCount: ratingRow.rated_count ?? 0,
    ratingDist,
  });
});

export default router;
