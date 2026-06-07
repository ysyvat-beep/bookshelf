// DELETE /api/quotes/:id   구절 삭제
import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: '구절을 찾을 수 없습니다.' });
  res.json({ ok: true });
});

export default router;
