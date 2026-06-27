from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from database import Base

class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # "Scooty" or "Car"
    price = Column(Integer, nullable=False)

class BlockedDateModel(Base):
    __tablename__ = "blocked_dates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    date_string = Column(String, nullable=False) # Format: "YYYY-MM-DD"

class BookingModel(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_address = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    status = Column(String, default="Pending Verification") # "Pending Verification", "Active Transit", "Returned Successfully"