import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RentalProvider } from './context/RentalContext';
import Navbar from './components/Navbar'; // Make sure the path to Navbar matches your folder structure!
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import Admin from './pages/Admin';

function App() {
  return (
    <RentalProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 antialiased">
          {/* 1. RENDER THE NAVBAR RIGHT HERE */}
          <Navbar />
          
          {/* Added pt-16 to push main content down so it doesn't get hidden behind the fixed navbar */}
          <main className="min-h-screen pt-16 py-8">
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