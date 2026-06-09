// 백엔드 REST API 호출 모음. 엔드포인트는 /api 로 시작
// 로컬 개발: 3000포트 실행
// Docker: Nginx가 /api → express-server 로 전달
// Render: VITE_API_BASE= https://bookshelf-1-qzrp.onrender.com/ 로 직접 호출

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `요청 실패 (${res.status})`);
  }
  // 204 No Content 대비
  return res.status === 204 ? null : res.json();
}

export const api = {
  // 검색
  search: (query) => request(`/search?query=${encodeURIComponent(query)}`),

  // 서재 / 책
  listBooks: ({ status, sort } = {}) => {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (sort) qs.set('sort', sort);
    const s = qs.toString();
    return request(`/books${s ? `?${s}` : ''}`);
  },
  getBook: (id) => request(`/books/${id}`),
  addBook: (book) => request('/books', { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (id, patch) => request(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // 구절
  addQuote: (bookId, quote) =>
    request(`/books/${bookId}/quotes`, { method: 'POST', body: JSON.stringify(quote) }),
  deleteQuote: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),

  // 통계
  stats: () => request('/stats'),
};

// 상태값
export const STATUS = {
  done: { label: '다 읽음', color: '#5a9367' },
  reading: { label: '읽는 중', color: '#c98a3c' },
  wish: { label: '찜', color: '#b5835a' },
};
