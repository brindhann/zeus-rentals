from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

import models
from database import engine, get_db

# Automatically build the database structures if they don't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zeus Car & Bike Rentals Engine")

# Crucial Security Layer: Allow your React app (running on localhost:5173) to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://zeus-rentals.vercel.app/"
                   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC SCHEMAS FOR DATA VALIDATION ---
class BookingCreate(BaseModel):
    vehicle_id: str
    customer_name: str
    customer_phone: str
    customer_address: str
    start_date: str
    end_date: str

class DateToggle(BaseModel):
    vehicle_id: str
    date_string: str

# --- 🛠️ SEED FUNCTION TO POPULATE INVENTORY ---
@app.on_event("startup")
def seed_inventory():
    db = next(get_db())
    if db.query(models.VehicleModel).count() == 0:
        inventory = [
            models.VehicleModel(id="v1", name="Honda Activa 6G", type="Scooty", price=500),
            models.VehicleModel(id="v2", name="Suzuki Access 125", type="Scooty", price=600),
            models.VehicleModel(id="v3", name="Maruti Swift Wagon", type="Car", price=2000),
            models.VehicleModel(id="v4", name="Hyundai i20 Turbo", type="Car", price=2500),
        ]
        db.add_all(inventory)
        db.commit()

# --- 🌐 CUSTOMER FACING API ENDPOINTS ---

@app.get("/api/vehicles")
def get_fleet(db: Session = Depends(get_db)):
    return db.query(models.VehicleModel).all()

@app.get("/api/availability/{vehicle_id}")
def get_blocked_dates(vehicle_id: str, db: Session = Depends(get_db)):
    dates = db.query(models.BlockedDateModel).filter(models.BlockedDateModel.vehicle_id == vehicle_id).all()
    return [d.date_string for d in dates]

@app.post("/api/bookings")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    # 1. Double check database blockouts to prevent concurrent bookings
    conflicts = db.query(models.BlockedDateModel).filter(
        models.BlockedDateModel.vehicle_id == booking.vehicle_id,
        models.BlockedDateModel.date_string.between(booking.start_date, booking.end_date)
    ).first()
    
    if conflicts:
        raise HTTPException(status_code=400, detail="Dates are locked out!")

    # 2. Write new entry
    new_booking = models.BookingModel(**booking.dict())
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return {"message": "Success", "booking_id": new_booking.id}

# --- 👑 HUBERT SECURE OPERATIONS ENDPOINTS ---

@app.get("/api/admin/bookings")
def get_admin_bookings(db: Session = Depends(get_db)):
    active = db.query(models.BookingModel).filter(models.BookingModel.status != "Returned Successfully").all()
    history = db.query(models.BookingModel).filter(models.BookingModel.status == "Returned Successfully").all()
    return {"active": active, "history": history}

@app.post("/api/admin/toggle-date")
def toggle_date(data: DateToggle, db: Session = Depends(get_db)):
    existing = db.query(models.BlockedDateModel).filter(
        models.BlockedDateModel.vehicle_id == data.vehicle_id,
        models.BlockedDateModel.date_string == data.date_string
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "unblocked"}
    else:
        new_block = models.BlockedDateModel(vehicle_id=data.vehicle_id, date_string=data.date_string)
        db.add(new_block)
        db.commit()
        return {"status": "blocked"}

@app.post("/api/admin/bookings/{booking_id}/action")
def update_booking_status(booking_id: int, action: str, db: Session = Depends(get_db)):
    booking = db.query(models.BookingModel).filter(models.BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking missing")
        
    if action == "APPROVE":
        booking.status = "Active Transit"
    elif action == "COMPLETE":
        booking.status = "Returned Successfully"
    elif action == "DENY":
        db.delete(booking)
        
    db.commit()
    return {"status": "updated"}