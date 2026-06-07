import { useState } from 'react';

// 별점 컴포넌트. readOnly=true 면 표시 전용, 아니면 클릭으로 입력.
export default function StarRating({ value = 0, onChange, readOnly = false, size = 'text-2xl' }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={`inline-flex ${size} select-none`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(n)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} leading-none px-0.5`}
          aria-label={`${n}점`}
        >
          <span className={n <= display ? 'text-amber-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}
