import React from 'react';
import { Link } from 'react-router-dom';
import { Car, LayoutDashboard, Bike } from 'lucide-react';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand Section */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-extrabold text-amber-500">
            <Car className="w-6 h-6" />
            <span>ZEUS RENTALS</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link to="/" className="text-slate-300 hover:text-amber-500 font-medium transition-colors flex items-center space-x-1">
              <Bike className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link to="/fleet" className="text-slate-300 hover:text-amber-500 font-medium transition-colors flex items-center space-x-1">
              <Car className="w-4 h-4" />
              <span>Browse Fleet</span>
            </Link>
            <Link to="/admin" className="text-slate-400 hover:text-amber-500 font-medium transition-colors flex items-center space-x-1 border-l border-slate-700 pl-4">
              <LayoutDashboard className="w-4 h-4" />
              <span>Hubert Admin</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;