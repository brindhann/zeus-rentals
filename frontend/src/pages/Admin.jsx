import React, { useState, useEffect } from 'react';
import { useRental } from '../context/RentalContext';
import { User, X, Calendar, Flame, Archive, AlertCircle, ChevronLeft, ChevronRight, CalendarDays, Trash2 } from 'lucide-react';

function Admin() {
  const { vehicles, activeBookings, historyBookings, refreshAdminData, API_BASE_URL, setActiveBookings, setHistoryBookings } = useRental();
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [blockedDates, setBlockedDates] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026

  useEffect(() => {
    refreshAdminData();
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles]);

  useEffect(() => {
    if (!selectedVehicleId) return;
    fetch(`${API_BASE_URL}/availability/${selectedVehicleId}`)
      .then(res => res.json())
      .then(data => setBlockedDates(data))
      .catch(err => console.error(err));
  }, [selectedVehicleId, activeBookings]);

  const formatToReadableDate = (dateString) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return dateString;
    return dateObj.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: totalDaysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const displayMonth = month + 1;
      return `${year}-${displayMonth < 10 ? '0' + displayMonth : displayMonth}-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const toggleDateBlockout = async (dateStr) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/toggle-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id: selectedVehicleId, date_string: dateStr })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.status === "blocked") {
          setBlockedDates([...blockedDates, dateStr]);
        } else {
          setBlockedDates(blockedDates.filter(d => d !== dateStr));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkflowAction = async (bookingId, actionStr) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/action?action=${actionStr}`, {
        method: "POST"
      });
      if (res.ok) {
        refreshAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteActiveBookingLocally = (id) => {
    setActiveBookings(activeBookings.filter(b => b.id !== id));
  };

  const deleteArchivedBookingLocally = (id) => {
    setHistoryBookings(historyBookings.filter(h => h.id !== id));
  };

  const monthDaysArray = generateMonthDays();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-10 animate-fade-in text-slate-800">
      
      <div className="flex justify-between items-center border-b-4 border-slate-200 pb-5">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hubert's Hub</h1>
          <p className="text-slate-400 font-extrabold text-sm tracking-wider uppercase mt-1">OPERATIONS CONTROL DESK</p>
        </div>
        <div className="bg-slate-100 border-4 border-slate-200 text-slate-700 px-5 py-2 rounded-xl font-black text-sm">
          LIVE OPERATIONAL ENVIRONMENT
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-700 flex items-center gap-2">
              <Flame className="text-[var(--brand-main)] w-6 h-6" /> PRESENT CLIENT BOOKINGS
            </h3>
            
            <div className="bg-white border-4 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              {activeBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold text-base">No present client bookings found inside the database logs.</div>
              ) : (
                <div className="divide-y-4 divide-slate-100">
                  {activeBookings.map((b) => {
                    const vehicleName = vehicles.find(v => v.id === b.vehicle_id)?.name || "Vehicle";
                    return (
                      <div key={b.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="bg-slate-100 p-3 rounded-full text-slate-500 border-2 border-slate-200"><User className="w-5 h-5" /></div>
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-900 text-lg">{b.customer_name}</h4>
                            <p className="text-base font-extrabold text-slate-500">Phone: {b.customer_phone}</p>
                            <p className="text-base font-bold text-[var(--brand-main)]">Assigned Vehicle: {vehicleName}</p>
                            <p className="text-sm font-semibold text-slate-400">Address: {b.customer_address}</p>
                            <div className="inline-flex items-center gap-2 mt-2 bg-slate-100 border-2 border-slate-200 px-3 py-1 rounded-xl text-xs font-black tracking-wide text-slate-700 uppercase">
                              <CalendarDays className="w-4 h-4 text-[var(--brand-main)]" />
                              <span>{formatToReadableDate(b.start_date)}</span>
                              <span className="text-slate-400 font-normal">➔</span>
                              <span>{formatToReadableDate(b.end_date)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 justify-end shrink-0">
                          {b.status === "Pending Verification" ? (
                            <>
                              <button onClick={() => handleWorkflowAction(b.id, "DENY")} className="p-3 bg-slate-100 text-[var(--brand-danger)] rounded-xl border-2 border-slate-200 hover:bg-rose-50 cursor-pointer"><X className="w-5 h-5" /></button>
                              <button onClick={() => handleWorkflowAction(b.id, "APPROVE")} className="px-5 py-3 duo-btn-primary text-sm font-black rounded-xl tracking-wide cursor-pointer">APPROVE</button>
                            </>
                          ) : (
                            <button onClick={() => handleWorkflowAction(b.id, "COMPLETE")} className="px-6 py-3 font-black text-sm text-white bg-emerald-600 border-b-4 border-emerald-800 active:border-b-0 rounded-xl tracking-wider cursor-pointer transform active:translate-y-1 transition-all">
                              MARK RETURNED
                            </button>
                          )}
                          <button onClick={() => deleteActiveBookingLocally(b.id)} className="p-3 text-slate-400 hover:text-[var(--brand-danger)] transition-colors cursor-pointer"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-700 flex items-center gap-2"><Archive className="text-slate-400 w-6 h-6" /> BOOKING ARCHIVE LOGS</h3>
            <div className="bg-white border-4 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {historyBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-base font-bold bg-white">Historical logs are currently blank.</div>
              ) : (
                <div className="divide-y-4 divide-slate-100 bg-slate-50/50">
                  {historyBookings.map((h) => (
                    <div key={h.id} className="p-5 flex justify-between items-center text-base font-semibold opacity-90">
                      <div>
                        <span className="font-black text-slate-800 text-lg">{h.customer_name}</span>
                        <p className="text-slate-400 font-bold text-sm">Vehicle Logged: {vehicles.find(v => v.id === h.vehicle_id)?.name}</p>
                        <p className="text-xs text-slate-400 font-black mt-1">{formatToReadableDate(h.start_date)} to {formatToReadableDate(h.end_date)}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-slate-100 text-slate-600 font-black px-3 py-1.5 rounded-xl border-2 border-slate-300 text-xs tracking-wider uppercase">RETURN COMPLETED</span>
                        <button onClick={() => deleteArchivedBookingLocally(h.id)} className="p-2 text-slate-400 hover:text-[var(--brand-danger)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-700 flex items-center gap-2"><Calendar className="text-slate-700 w-6 h-6" /> VEHICLE AVAILABILITY</h3>
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Select Active Vehicle</label>
              <select 
                className="w-full border-4 border-slate-200 p-3 rounded-xl font-black text-base bg-slate-50 text-slate-700 outline-none focus:border-[var(--brand-main)] transition-colors"
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
              >
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl border-2 border-slate-200">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg transition-colors bg-white shadow-sm border-2 border-slate-200 cursor-pointer"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
              <div className="text-center font-black text-sm text-slate-700 uppercase tracking-wider">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg transition-colors bg-white shadow-sm border-2 border-slate-200 cursor-pointer"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-400">
              <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {monthDaysArray.map((dateStr, index) => {
                const dayNum = index + 1;
                const isBlocked = blockedDates.includes(dateStr);
                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleDateBlockout(dateStr)}
                    style={{
                      backgroundColor: isBlocked ? 'var(--brand-danger)' : 'var(--brand-main)',
                      borderColor: isBlocked ? 'var(--brand-danger-dark)' : '#166534',
                      color: '#ffffff'
                    }}
                    className="h-10 w-full rounded-xl font-black text-sm flex flex-col items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 transition-all duration-75 cursor-pointer shadow-sm"
                  >
                    <span>{dayNum}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="text-xs font-bold text-slate-400 flex items-start gap-2 bg-slate-50 p-4 rounded-xl border-2 border-slate-200 leading-relaxed">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <span>Green squares are set as available. Tap individual calendar days to toggle specific dates to Red (Unavailable).</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Admin;