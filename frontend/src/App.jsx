import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RentalProvider } from './context/RentalContext';
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import Admin from './pages/Admin';

function App() {
  return (
    <RentalProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 antialiased">
          {/* Main layout container with padding adjusted since sidebars are dropped */}
          <main className="min-h-screen py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/hubert-secure-operations" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </RentalProvider>
  );
}

export default App;