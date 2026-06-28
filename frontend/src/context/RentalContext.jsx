import React, { createContext, useContext, useState, useEffect } from 'react';

const RentalContext = createContext();
const API_BASE_URL = "https://zeus-rentals-backend.onrender.com";
// Change this temporarily for local development testing:
// const API_BASE_URL = "http://127.0.0.1:8000";

export function RentalProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);

  // 1. Fetch the live fleet inventory on app startup
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/vehicles`) //  Added /api
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error("Error fetching vehicles:", err));
  }, []);

  // 2. Fetch admin dashboard queues dynamically
  const refreshAdminData = () => {
    fetch(`${API_BASE_URL}/api/admin/bookings`) //  Added /api
      .then(res => res.json())
      .then(data => {
        setActiveBookings(data.active || []);
        setHistoryBookings(data.history || []);
      })
      .catch(err => console.error("Error fetching admin bookings:", err));
  };

  // 3. Check dynamic date blockouts against the live server database
  const checkVehicleAvailability = async (vehicleId, startStr, endStr) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/availability/${vehicleId}`); //  Added /api
      const blockedDates = await res.json(); // Array of "YYYY-MM-DD" strings

      let current = new Date(startStr);
      const end = new Date(endStr);

      while (current <= end) {
        const dateString = current.toISOString().split('T')[0];
        if (blockedDates.includes(dateString)) {
          return false; // Found a matching blocked date row in SQLite!
        }
        current.setDate(current.getDate() + 1);
      }
      return true;
    } catch (err) {
      console.error("Availability check failed:", err);
      return false;
    }
  };

  return (
    <RentalContext.Provider value={{
      vehicles,
      activeBookings,
      historyBookings,
      refreshAdminData,
      checkVehicleAvailability,
      API_BASE_URL
    }}>
      {children}
    </RentalContext.Provider>
  );
}

export const useRental = () => useContext(RentalContext);