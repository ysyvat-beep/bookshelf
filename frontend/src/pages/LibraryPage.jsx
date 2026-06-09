import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, STATUS } from '../api/client.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import BookCard from '../components/BookCard.jsx';

// 탭 정의: 전체 + 상태별 3개(다읽음/읽는중/찜) 
const TABS = [
  { key: 'all', label: '전체' },
  { key: 'done', label: STATUS.done.label },
  { key: 'reading', label: STATUS.reading.label },
  { key: 'wish', label: STATUS.wish.label },
];

export default function LibraryPage() {
  // 선택 탭/정렬/그리드 개수는 localStorage에 보관 
  const [tab, setTab] = useLocalStorage('lib-tab', 'all');
  const [sort, setSort] = useLocalStorage('lib-sort', 'created');
  const [perRow, setPerRow] = useLocalStorage('lib-perRow', 4);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .listBooks({ status: tab === 'all' ? undefined : tab, sort })
      .then((d) => setBooks(d.books))
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  }, [tab, sort]);

  // perRow → Tailwind grid 클래스 매핑 
  const gridCols = {
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-3 sm:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-6',
  }[perRow] || 'grid-cols-2 sm:grid-cols-4';

  return (
    <div>
      {/* 상태별 탭 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm ${
              tab === t.key ? 'bg-shelf-dark text-white' : 'bg-white text-shelf-dark border'
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* 사용자 설정: 정렬 + 한 줄 표시 개수 */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-2 py-1">
            <option value="created">등록순</option>
            <option value="rating">별점순</option>
          </select>
          <select value={perRow} onChange={(e) => setPerRow(Number(e.target.value))} className="border rounded px-2 py-1">
            <option value={3}>3개씩</option>
            <option value={4}>4개씩</option>
            <option value={5}>5개씩</option>
            <option value={6}>6개씩</option>
          </select>
        </div>
      </div>

      {/* 그리드 */}
      {loading ? (
        <p className="text-center text-gray-400 py-20">불러오는 중…</p>
      ) : books.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="mb-3">아직 책이 없어요.</p>
          <Link to="/search" className="text-shelf-accent underline">
            책을 검색해 서재에 추가해보세요 →
          </Link>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-4`}>
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
