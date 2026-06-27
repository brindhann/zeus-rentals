import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, Phone, Mail, MapPin, Clock } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between animate-fade-in">
      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-center gap-12 flex-grow">
        
        <div className="text-center lg:text-left flex-1 space-y-6">
          <h1 className="text-6xl md:text-7xl font-black text-[var(--brand-main)] tracking-tight uppercase">
            Zeus Rentals
          </h1>
          <div className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
            The affordable way to explore the city.
          </div>
          <p className="text-xl font-semibold text-slate-500 max-w-lg">
            Rent pristine cars and bikes around Shillong with zero security deposit headaches.
          </p>
        </div>

        <div className="w-full max-w-md bg-white border-4 border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-4 p-4 border-2 border-slate-100 rounded-2xl bg-slate-50">
            <div className="bg-emerald-50 p-3 rounded-xl border-2 border-emerald-100 text-[var(--brand-main)]">
              <CalendarRange className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-800">Instant Online Booking</div>
              <div className="text-xs font-bold text-slate-400">Select dates and reserve your ride smoothly.</div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/fleet')}
            className="duo-btn-primary w-full py-4 font-black text-xl rounded-2xl tracking-wide uppercase cursor-pointer"
          >
            Book your ride
          </button>
        </div>
      </div>

      <footer className="bg-white border-t-4 border-slate-200 py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-600 font-semibold">
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 uppercase tracking-wider">Zeus Rentals HQ</h4>
            <p className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-[var(--brand-main)] shrink-0 mt-0.5" />
              <span>House no 001, Laitumkhrah,<br />Shillong, Meghalaya 793003</span>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-slate-800 uppercase tracking-wider">Contact & Support</h4>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--brand-main)]" /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--brand-main)]" /> support@zeusrentals.com</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-slate-800 uppercase tracking-wider">Operational Hours</h4>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--brand-main)]" /> Mon - Sun: 10:00 AM - 07:00 PM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;