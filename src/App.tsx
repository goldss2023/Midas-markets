import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';

const Admin = lazy(() => import('./Admin'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#050505] text-[#d4af37] flex items-center justify-center font-bold">Loading...</div>}>
              <Admin />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
