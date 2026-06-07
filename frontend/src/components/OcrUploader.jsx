import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

// ── 1) 이미지 전처리 ────────────────────────────────────────────
// Canvas API로 그레이스케일 + 대비 강화 → OCR 정확도 향상
function preprocessImage(objectUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 너무 작은 이미지는 확대, 너무 크면 축소 (Tesseract 최적 해상도 유지)
      const MAX = 2400;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const scale = Math.max(ratio, Math.min(2, 1400 / Math.min(img.width, img.height)));

      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 픽셀 처리: 그레이스케일 변환 + 대비 1.6배 강화
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      const CONTRAST = 1.6;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const val  = Math.min(255, Math.max(0, CONTRAST * (gray - 128) + 128));
        d[i] = d[i + 1] = d[i + 2] = val; // R, G, B 동일하게
        // alpha(d[i+3])는 그대로
      }
      ctx.putImageData(imageData, 0, 0);

      // PNG blob → Object URL
      canvas.toBlob(
        (blob) => resolve(URL.createObjectURL(blob)),
        'image/png',
        1.0,
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

// ── 2) OCR 결과 후처리 ──────────────────────────────────────────
// 책 구절의 불필요한 줄바꿈을 이어붙이고 빈 줄을 정리합니다.
function cleanOcrText(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 문장 중간 줄바꿈: 한글/영문으로 끝나는 줄 뒤에 바로 글자가 오면 공백으로 이어붙임
    // (마침표·물음표·느낌표·닫는따옴표로 끝나는 줄은 유지)
    .replace(/([가-힣a-zA-Z,])\n([가-힣a-zA-Z"'])/g, '$1 $2')
    // 3줄 이상 연속 빈 줄 → 2줄로
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── 컴포넌트 ────────────────────────────────────────────────────
export default function OcrUploader({ bookId, onSave }) {
  const [progress, setProgress]   = useState(0);
  const [status, setStatus]       = useState(''); // 단계 메시지
  const [busy, setBusy]           = useState(false);
  const [preview, setPreview]     = useState('');
  // 네트워크 끊김 등 대비: 추출 텍스트를 localStorage에 임시 저장 (자동 복구용)
  const [draft, setDraft] = useLocalStorage(`ocr-draft-${bookId}`, '');
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setBusy(true);
    setProgress(0);
    setStatus('이미지 전처리 중…');

    try {
      // 1) 전처리된 이미지 URL 생성
      const processedUrl = await preprocessImage(objectUrl);
      setStatus('텍스트 인식 중…');

      // 2) Tesseract OCR
      //    - lang: 한국어 + 영어
      //    - PSM 6: 단일 균일 텍스트 블록 (책 페이지에 최적)
      const { data } = await Tesseract.recognize(processedUrl, 'kor+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
        tessedit_pageseg_mode: '6',   // Single uniform block of text
        preserve_interword_spaces: '1',
      });

      // 3) 후처리
      setDraft(cleanOcrText(data.text));
      setStatus('인식 완료 ✓');
    } catch (err) {
      alert('OCR 처리 중 오류가 발생했습니다: ' + err.message);
      setStatus('');
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    const text = draft.trim();
    if (!text) return;
    await onSave(text);
    setDraft('');
    setPreview('');
    setStatus('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="border-2 border-dashed border-shelf-accent/40 rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-2">구절 사진 올리기 (OCR)</h3>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={busy}
        className="block w-full text-sm mb-3"
      />

      {preview && (
        <img src={preview} alt="업로드 미리보기" className="max-h-48 rounded mb-3 mx-auto object-contain" />
      )}

      {busy && (
        <div className="mb-3">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-shelf-accent rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{status} {progress > 0 && `${progress}%`}</p>
        </div>
      )}
      {!busy && status && (
        <p className="text-xs text-green-600 mb-2">{status}</p>
      )}

      {/* 추출된 텍스트: 사용자가 직접 다듬을 수 있도록 textarea로 노출 */}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="추출된 구절이 여기에 표시됩니다. 직접 수정할 수도 있어요."
        rows={5}
        className="w-full border rounded p-2 text-sm mb-2 resize-y"
      />

      <button
        onClick={handleSave}
        disabled={busy || !draft.trim()}
        className="bg-shelf-accent text-white px-4 py-2 rounded disabled:opacity-40"
      >
        구절로 저장
      </button>
    </div>
  );
}
