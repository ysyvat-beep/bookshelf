import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, STATUS } from '../api/client.js';
import StarRating from '../components/StarRating.jsx';
import OcrUploader from '../components/OcrUploader.jsx';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [editing, setEditing] = useState(false);

  function load() {
    api.getBook(id).then((d) => setBook(d.book)).catch((e) => alert(e.message));
  }
  useEffect(() => { load(); }, [id]);

  if (!book) return <p className="text-center text-gray-400 py-20">불러오는 중…</p>;

  async function saveQuote(text) {
    await api.addQuote(book.id, { quote_text: text });
    load();
  }
  async function removeQuote(qid) {
    if (!confirm('이 구절을 삭제할까요?')) return;
    await api.deleteQuote(qid);
    load();
  }
  async function removeBook() {
    if (!confirm('이 책과 모든 구절을 삭제할까요?')) return;
    await api.deleteBook(book.id);
    navigate('/');
  }

  const status = STATUS[book.status] || STATUS.wish;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4">
        ← 서재로
      </button>

      {/* 상단: 표지 + 기본 정보 */}
      <div className="flex flex-col sm:flex-row gap-5 mb-6">
        <img
          src={book.cover_url || ''}
          alt={book.title}
          className="w-36 h-52 object-cover bg-gray-100 rounded-lg shadow mx-auto sm:mx-0"
        />
        <div className="flex-1">
          <span
            className="inline-block text-xs px-2 py-0.5 rounded-full text-white mb-2"
            style={{ backgroundColor: status.color }}
          >
            {status.label}
          </span>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-gray-500">{book.author}</p>
          <p className="text-sm text-gray-400">{book.publisher}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setEditing((v) => !v)} className="text-sm border rounded px-3 py-1">
              {editing ? '편집 닫기' : '감상 편집'}
            </button>
            <button onClick={removeBook} className="text-sm border border-red-300 text-red-500 rounded px-3 py-1">
              삭제
            </button>
          </div>
        </div>
      </div>

      {editing && <EditForm book={book} onSaved={() => { setEditing(false); load(); }} />}

      {/* 감상 카드 (한줄평 + 별점) */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2 text-shelf-accent">나의 감상</h2>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <StarRating value={book.rating} readOnly />
          <p className="mt-2 whitespace-pre-wrap">
            {book.review || <span className="text-gray-400">아직 한줄평이 없어요.</span>}
          </p>
          {(book.read_start || book.read_end) && (
            <p className="text-xs text-gray-400 mt-2">
              📖 {book.read_start || '?'} ~ {book.read_end || '?'}
            </p>
          )}
        </div>
      </section>

      {/* 구절 카드 영역 */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2 text-shelf-accent">인상깊은 구절 ({book.quotes.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {book.quotes.map((q) => (
            <div key={q.id} className="bg-white rounded-lg p-4 shadow-sm relative">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">“{q.quote_text}”</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>{q.created_at}</span>
                <button onClick={() => removeQuote(q.id)} className="text-red-400 hover:underline">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* OCR 업로더 */}
        <OcrUploader bookId={book.id} onSave={saveQuote} />
      </section>
    </div>
  );
}

// 상태/별점/한줄평/읽은 기간 편집 폼
function EditForm({ book, onSaved }) {
  const [status, setStatus] = useState(book.status);
  const [rating, setRating] = useState(book.rating || 0);
  const [review, setReview] = useState(book.review || '');
  const [readStart, setReadStart] = useState(book.read_start || '');
  const [readEnd, setReadEnd] = useState(book.read_end || '');

  async function save() {
    try {
      await api.updateBook(book.id, {
        status,
        rating,
        review,
        read_start: readStart || null,
        read_end: readEnd || null,
      });
      onSaved();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6 space-y-3">
      <div className="flex gap-2">
        {Object.entries(STATUS).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`px-3 py-1 rounded-full text-sm ${status === key ? 'bg-shelf-dark text-white' : 'border'}`}
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
        placeholder="감상을 자유롭게 적어보세요."
        rows={4}
        className="w-full border rounded p-2 text-sm resize-y"
      />
      <div className="flex gap-3 text-sm">
        <label className="flex-1">
          시작일
          <input type="date" value={readStart} onChange={(e) => setReadStart(e.target.value)} className="w-full border rounded p-1 mt-1" />
        </label>
        <label className="flex-1">
          완독일
          <input type="date" value={readEnd} onChange={(e) => setReadEnd(e.target.value)} className="w-full border rounded p-1 mt-1" />
        </label>
      </div>
      <button onClick={save} className="bg-shelf-accent text-white px-4 py-2 rounded">
        저장
      </button>
    </div>
  );
}
