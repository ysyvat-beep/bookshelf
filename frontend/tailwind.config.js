/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 서재 느낌의 따뜻한 색상 팔레트 (자유롭게 수정하세요)
        shelf: {
          bg: '#faf6f0',
          card: '#ffffff',
          accent: '#b5835a',
          dark: '#5a4632',
        },
      },
    },
  },
  plugins: [],
};
