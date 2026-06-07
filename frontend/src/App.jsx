import { Routes, Route, NavLink } from 'react-router-dom';
import LibraryPage from './pages/LibraryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import StatsPage from './pages/StatsPage.jsx';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive ? 'bg-shelf-accent text-white' : 'text-shelf-dark hover:bg-shelf-accent/10'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-shelf-card shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <NavLink to="/" className="text-xl font-bold mr-4">
            📚 나의 서재
          </NavLink>
          <nav className="flex gap-1 ml-auto">
            <NavItem to="/">서재</NavItem>
            <NavItem to="/search">책 검색</NavItem>
            <NavItem to="/stats">통계</NavItem>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  );
}
