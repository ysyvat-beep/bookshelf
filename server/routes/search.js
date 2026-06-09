// GET /api/search?query=검색어
// API 키를 서버에서만 사용해 노출을 막습니다. (보안 강화)
import { Router } from 'express';
import axios from 'axios';

const router = Router();
const KAKAO_URL = 'https://dapi.kakao.com/v3/search/book';

router.get('/', async (req, res, next) => {
  const query = (req.query.query || '').trim();
  if (!query) return res.status(400).json({ error: 'query 파라미터가 필요합니다.' });

  const key = process.env.KAKAO_API_KEY;
  if (!key || key.includes('여기에')) {
    return res.status(500).json({
      error: 'KAKAO_API_KEY가 설정되지 않았습니다. server/.env 를 확인하세요.',
    });
  }

  try {
    const { data } = await axios.get(KAKAO_URL, {
      headers: { Authorization: `KakaoAK ${key}` },
      params: { query, size: 20 },
    });

    // 프론트에서 쓰기 쉬운 형태로 정규화
    const results = data.documents.map((d) => ({
      isbn: d.isbn,               // "9788... 1234" 형태일 수 있음
      title: d.title,
      author: d.authors.join(', '),
      publisher: d.publisher,
      cover_url: d.thumbnail,
      datetime: d.datetime,       // 출판일
    }));

    res.json({ results });
  } catch (err) {
    // 카카오 API 에러를 그대로 노출하지 않고 메시지만 전달
    const status = err.response?.status || 502;
    next(Object.assign(new Error('카카오 도서 검색에 실패했습니다.'), { status }));
  }
});

export default router;
