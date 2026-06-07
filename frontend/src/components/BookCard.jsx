import { Link } from 'react-router-dom';
import { STATUS } from '../api/client.js';
import StarRating from './StarRating.jsx';

// 서재 그리드의 표지 한 장. 클릭하면 상세 페이지로 이동.
export default function BookCard({ book }) {
  const status = STATUS[book.status] || STATUS.wish;

  return (
    <Link
      to={`/books/${book.id}`}
      className="group block rounded-lg overflow-hidden bg-shelf-card shadow hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[2/3] bg-gray-100 overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-2 text-center">
            {book.title}
          </div>
        )}
      </div>
      <div className="p-2">
        <span
          className="inline-block text-xs px-2 py-0.5 rounded-full text-white mb-1"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </span>
        <p className="font-semibold text-sm line-clamp-1">{book.title}</p>
        <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>
        {book.rating > 0 && <StarRating value={book.rating} readOnly size="text-sm" />}
      </div>
    </Link>
  );
}
