import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, STATUS } from '../api/client.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import StarRating from '../components/StarRating.jsx';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useLocalStorage('recent-searches', []); // 최근 검색어
  const [selected, setSelected] = useState(null); 

  async function runSearch(q) {
    const keyword = (q ?? query).trim();
    if (!keyword) return;
    setLoading(true);
    setSelected(null);
    try {
      const { results } = await api.search(keyword);
      setResults(results);
      // 최근 검색어 갱신 (중복 제거, 최대 8개)
      setRecent([keyword, ...recent.filter((r) => r !== keyword)].slice(0, 8));
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* 검색창 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="flex gap-2 mb-3"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 또는 저자를 입력하세요"
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <button type="submit" className="bg-shelf-accent text-white px-5 py-2 rounded-lg">
          검색
        </button>
      </form>

      {/* 최근 검색어 */}
      {recent.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 text-sm">
          <span className="text-gray-400">최근:</span>
          {recent.map((r) => (
            <button
              key={r}
              onClick={() => {
                setQuery(r);
                runSearch(r);
              }}
              className="text-shelf-accent hover:underline"
            >
              {r}
            </button>
          ))}
          <button onClick={() => setRecent([])} className="text-gray-400 hover:underline ml-1">
            지우기
          </button>
        </div>
      )}

      {loading && <p className="text-center text-gray-400 py-10">검색 중…</p>}

      {/* 검색 결과 목록 */}
      <div className="space-y-3">
        {results.map((book, i) => (
          <div key={`${book.isbn}-${i}`} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex gap-3">
              <img
                src={book.cover_url || ''}
                alt={book.title}
                className="w-16 h-24 object-cover bg-gray-100 rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold line-clamp-2">{book.title}</p>
                <p className="text-sm text-gray-500">{book.author}</p>
                <p className="text-xs text-gray-400">{book.publisher}</p>
                <button
                  onClick={() => setSelected(selected?.idx === i ? null : { idx: i, book })}
                  className="mt-2 text-sm text-shelf-accent border border-shelf-accent rounded px-3 py-1"
                >
                  {selected?.idx === i ? '닫기' : '서재에 추가'}
                </button>
              </div>
            </div>

            {/* 상태/별점/한줄평 저장 폼 */}
            {selected?.idx === i && (
              <SaveForm
                book={book}
                onSaved={(saved) => navigate(`/books/${saved.id}`)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 검색 결과를 서재에 저장하는 폼
function SaveForm({ book, onSaved }) {
  const [status, setStatus] = useState('wish');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const { book: saved } = await api.addBook({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        cover_url: book.cover_url,
        status,
        rating,
        review,
      });
      onSaved(saved);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t space-y-3">
      <div className="flex gap-2">
        {Object.entries(STATUS).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`px-3 py-1 rounded-full text-sm ${
              status === key ? 'bg-shelf-dark text-white' : 'border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">별점</span>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="자유롭게 감상을 남겨보세요."
        rows={4}
        className="w-full border rounded p-2 text-sm resize-y" 
      />
      <button
        onClick={save}
        disabled={saving}
        className="bg-shelf-accent text-white px-4 py-2 rounded disabled:opacity-40"
      >
        {saving ? '저장 중…' : '서재에 저장'}
      </button>
    </div>
  );
}
