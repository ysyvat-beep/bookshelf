import { useState, useEffect } from 'react';

// localStorage 와 동기화되는 state 훅.
// 과제 요구: 선택 탭/그리드 보기 개수/최근 검색어 등을 localStorage에 보관.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* 저장 실패는 무시 (용량 초과 등) */
    }
  }, [key, value]);

  return [value, setValue];
}
