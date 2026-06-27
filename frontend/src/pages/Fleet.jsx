import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRental } from '../context/RentalContext';
import { 
  Calendar, User, ShieldCheck, CreditCard, Upload, X, Frown, Car, Bike, ArrowLeft, 
  MapPin, Phone, Mail, Clock, ShieldAlert 
} from 'lucide-react';

function Fleet() {
  const navigate = useNavigate();
  const { vehicles, checkVehicleAvailability, API_BASE_URL } = useRental();
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [step, setStep] = useState(1); 
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerInfo, setCustomerInfo] = useState({ name: "", address: "", contact: "" });
  const [files, setFiles] = useState({ govtId: null, license: null });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const handleOpenModal = (vehicle) => {
    setActiveVehicle(vehicle);
    setStep(1);
    setErrors({});
    setStartDate("");
    setEndDate("");
    setCustomerInfo({ name: "", address: "", contact: "" });
    setFiles({ govtId: null, license: null });
    setAgreedToTerms(false);
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const diffTime = new Date(endDate) - new Date(startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays + 1 : 1;
  };

  const totalDays = calculateDays();
  const totalAmount = activeVehicle ? activeVehicle.price * totalDays : 0;
  const advanceAmount = Math.round(totalAmount * 0.25);
  const remainingAmount = totalAmount - advanceAmount;

  const handleCheckDates = async () => {
    let errs = {};
    const todayStr = new Date().toISOString().split('T')[0];

    if (!startDate || !endDate) errs.dates = "Please pick your required dates.";
    else if (startDate < todayStr) errs.dates = "Start date cannot be in the past.";
    else if (startDate > endDate) errs.dates = "Return date must be after the start date.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const isFree = await checkVehicleAvailability(activeVehicle.id, startDate, endDate);
    if (!isFree) {
      setErrors({ dates: "We are sorry, but this vehicle is already reserved for these dates. Please choose another date or browse alternative vehicles." });
      return;
    }

    setErrors({});
    setStep(2);
  };

  const handleVerifyDetails = (e) => {
    e.preventDefault();
    let errs = {};

    if (!/^[a-zA-Z\s]{4,30}$/.test(customerInfo.name)) errs.name = "Please enter a valid name (min 4 characters).";
    if (!/^\d{10}$/.test(customerInfo.contact)) errs.contact = "Please enter a valid 10-digit mobile number.";
    if (customerInfo.address.trim().length < 10) errs.address = "Please enter a complete residential address.";
    if (!files.govtId) errs.govtId = "Please upload a valid government ID copy.";
    if (!files.license) errs.license = "Please upload a copy of your driver's license.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStep(3); 
  };

  const finalizeBooking = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: activeVehicle.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.contact,
          customer_address: customerInfo.address,
          start_date: startDate,
          end_date: endDate
        })
      });
      if (response.ok) {
        setStep(5);
      } else {
        const errData = await response.json();
        alert(`Request failed: ${errData.detail}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 animate-fade-in text-base">
      <div className="max-w-6xl w-full mx-auto px-6 py-6 flex-grow space-y-8">
        
        {/* Top Navigation Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Available vehicles</h1>
            <p className="text-slate-500 font-bold text-base">Select dates and check structural fleet allocation options.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-4 border-slate-200 text-[var(--brand-main)] font-black text-base rounded-xl hover:bg-slate-100 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Vehicle Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white border-4 border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-[var(--brand-main)] hover:-translate-y-1 transition-all duration-300 shadow-sm group">
              <div>
                <div className="flex justify-center text-slate-300 group-hover:text-[var(--brand-main)] transition-colors duration-300 my-6">
                  {v.type === "Car" ? <Car className="w-16 h-16 stroke-[1.5]" /> : <Bike className="w-16 h-16 stroke-[1.5]" />}
                </div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border-2 border-slate-200">
                  {v.type}
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-2">{v.name}</h3>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wide">Rate</span>
                  <span className="text-2xl font-black text-slate-800">₹{v.price}<span className="text-xs text-slate-400 font-bold">/day</span></span>
                </div>
                <button onClick={() => handleOpenModal(v)} className="w-full py-3.5 duo-btn-primary text-base tracking-wide font-black rounded-xl cursor-pointer">
                  SELECT RIDE
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Booking Modal Context */}
        {activeVehicle && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 pt-20 sm:pt-28 overflow-y-auto animate-fade-in">
            <div className="bg-white border-4 border-slate-200 w-full max-w-lg rounded-3xl p-8 shadow-xl relative">
        
              {/* High-Visibility Red Close Badge */}
              <button 
                onClick={() => setActiveVehicle(null)} 
                className="absolute -top-3 -right-3 z-10 bg-[var(--brand-danger)] hover:bg-[var(--brand-danger-dark)] text-white p-2.5 rounded-full shadow-lg border-2 border-white transition-colors duration-150 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Progress Flow Metrics */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                <div className="bg-[var(--brand-main)] h-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }}></div>
              </div>

              {/* STEP 1: DATES */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Calendar className="text-[var(--brand-main)] w-6 h-6" /> Tell us the dates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">Pick Up Date</label>
                      <input type="date" className="w-full border-4 border-slate-200 p-3 rounded-xl font-black focus:border-[var(--brand-main)] outline-none text-base bg-slate-50" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">Return Date</label>
                      <input type="date" className="w-full border-4 border-slate-200 p-3 rounded-xl font-black focus:border-[var(--brand-main)] outline-none text-base bg-slate-50" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>
                  {errors.dates && (
                    <div className="border-2 border-[var(--brand-danger)] bg-rose-50 p-4 rounded-xl flex items-start gap-2 text-[var(--brand-danger)]">
                      <Frown className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="font-bold text-sm leading-normal">{errors.dates}</p>
                    </div>
                  )}
                  <button onClick={handleCheckDates} className="w-full py-3.5 duo-btn-primary text-base tracking-wide font-black rounded-xl cursor-pointer">
                    CHECK AVAILABILITY
                  </button>
                </div>
              )}

              {/* STEP 2: DETAILS */}
              {step === 2 && (
                <form onSubmit={handleVerifyDetails} className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2"><User className="text-[var(--brand-main)] w-6 h-6" /> Personal Information</h3>
                  <p className="text-sm font-bold text-slate-400 bg-slate-50 border-2 border-slate-200 p-3 rounded-xl">Your Personal information is safe with us.</p>
                  <div>
                    <input type="text" placeholder="Your Full Name" className="w-full border-4 border-slate-200 p-3 rounded-xl font-black focus:border-[var(--brand-main)] outline-none text-base bg-slate-50" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    {errors.name && <p className="text-[var(--brand-danger)] font-black text-xs mt-1 ml-1">{errors.name}</p>}
                  </div>
                  <div>
                    <input type="text" placeholder="Contact Phone Number" className="w-full border-4 border-slate-200 p-3 rounded-xl font-black focus:border-[var(--brand-main)] outline-none text-base bg-slate-50" value={customerInfo.contact} onChange={e => setCustomerInfo({...customerInfo, contact: e.target.value})} />
                    {errors.contact && <p className="text-[var(--brand-danger)] font-black text-xs mt-1 ml-1">{errors.contact}</p>}
                  </div>
                  <div>
                    <textarea placeholder="Residential Address" rows="2" className="w-full border-4 border-slate-200 p-3 rounded-xl font-black focus:border-[var(--brand-main)] outline-none text-base bg-slate-50" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}></textarea>
                    {errors.address && <p className="text-[var(--brand-danger)] font-black text-xs mt-1 ml-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex flex-col items-center justify-center border-4 border-dashed p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${files.govtId ? 'border-[var(--brand-main)] bg-emerald-50 text-[var(--brand-main)]' : 'border-slate-200 text-slate-400'}`}>
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs font-black">{files.govtId ? "ID Attached" : "Upload Govt ID"}</span>
                      <input type="file" className="hidden" onChange={e => setFiles({...files, govtId: e.target.files[0] || null})} />
                    </label>
                    <label className={`flex flex-col items-center justify-center border-4 border-dashed p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${files.license ? 'border-[var(--brand-main)] bg-emerald-50 text-[var(--brand-main)]' : 'border-slate-200 text-slate-400'}`}>
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs font-black">{files.license ? "License Attached" : "Upload Driving License"}</span>
                      <input type="file" className="hidden" onChange={e => setFiles({...files, license: e.target.files[0] || null})} />
                    </label>
                  </div>
                  <button type="submit" className="w-full py-3.5 duo-btn-primary text-base tracking-wide font-black rounded-xl cursor-pointer">
                    Proceed to payment
                  </button>
                </form>
              )}

              {/* STEP 3: TERMS & CONDITIONS */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><ShieldAlert className="text-[var(--brand-danger)] w-6 h-6" /> Rental Terms & Conditions</h3>
                  <div className="bg-slate-50 border-4 border-slate-200 p-4 rounded-2xl h-40 overflow-y-auto text-sm text-slate-600 space-y-2 font-semibold leading-relaxed">
                    <p>1. The rider must carry an original valid driving license during vehicle handover.</p>
                    <p>2. Fuel charges are explicitly borne by the client. The vehicle must be returned with the same fuel level as dispatched.</p>
                    <p>3. Any fines, traffic violations, or physical damage incurred during transit are the absolute responsibility of the customer.</p>
                    <p>4. Delay in return beyond the scheduled hours will attract standard hourly penalties.</p>
                  </div>
                  <label className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border-4 border-slate-200 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[var(--brand-main)] rounded" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} />
                    <span className="text-sm font-black text-slate-700">I read, understood, and agree to the rental terms.</span>
                  </label>
                  <button 
                    disabled={!agreedToTerms}
                    onClick={() => setStep(4)}
                    className={`w-full py-3.5 text-white font-black rounded-xl text-base tracking-wide ${agreedToTerms ? 'duo-btn-primary cursor-pointer' : 'bg-slate-300 cursor-not-allowed border-none'}`}
                  >
                    CONTINUE
                  </button>
                </div>
              )}

              {/* STEP 4: BOOKING SUMMARY */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><CreditCard className="text-[var(--brand-main)] w-6 h-6" /> Booking Summary</h3>
                  <div className="bg-slate-50 border-4 border-slate-200 p-5 rounded-2xl space-y-3 text-base font-black">
                    <div className="flex justify-between text-slate-500"><span>Vehicle:</span><span className="text-slate-800">{activeVehicle.name}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Duration:</span><span className="text-slate-700">{totalDays} Day(s)</span></div>
                    <hr className="border-b-2 border-slate-200" />
                    <div className="flex justify-between text-slate-600"><span>Total Amount:</span><span className="text-slate-900">₹{totalAmount}</span></div>
                    <div className="flex justify-between text-[var(--brand-main)] bg-emerald-50/50 p-2 rounded-xl border-2 border-emerald-100"><span>Advance to be Paid (25%):</span><span>₹{advanceAmount}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Remaining Amount on Pickup:</span><span className="text-slate-900">₹{remainingAmount}</span></div>
                  </div>
                  <button onClick={finalizeBooking} className="w-full py-3.5 duo-btn-primary text-base tracking-wide font-black rounded-xl cursor-pointer">
                    PROCEED TO PAYMENT
                  </button>
                </div>
              )}

              {/* STEP 5: CELEBRATION */}
              {step === 5 && (
                <div className="text-center space-y-4 py-6">
                  <div className="inline-flex bg-emerald-50 text-[var(--brand-main)] p-4 rounded-full border-4 border-emerald-200 mb-1"><ShieldCheck className="w-12 h-12" /></div>
                  <h3 className="text-3xl font-black text-slate-900">Booking Secured</h3>
                  <p className="text-slate-500 font-extrabold text-base max-w-sm mx-auto leading-relaxed">
                    Thank you for choosing us. Our team has received your request. We are kindly looking for your arrival.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Business Details Footer */}
      <footer className="bg-white border-t-4 border-slate-200 py-10 px-6 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-base text-slate-600 font-black">
          <div className="space-y-3">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-base">Zeus Rentals HQ</h4>
            <p className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-[var(--brand-main)] shrink-0 mt-0.5" />
              <span>House no 001, Laitumkhrah,<br />Shillong, Meghalaya 793003</span>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-base">Contact & Support</h4>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--brand-main)]" /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--brand-main)]" /> support@zeusrentals.com</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-base">Operational Hours</h4>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--brand-main)]" /> Mon - Sun: 10:00 AM - 07:00 PM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Fleet;