import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Зв'язок з маршрутами
    routes = relationship("TrackedRoute", back_populates="owner")

class TrackedRoute(Base):
    __tablename__ = "tracked_routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Зв'язок з користувачем (FK)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # nullable=True для сумісності з існуючими даними
    
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_date = Column(Date, nullable=False)
    target_price = Column(Float, nullable=False)
    check_interval = Column(Integer, default=6)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="routes")

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(UUID(as_uuid=True), ForeignKey("tracked_routes.id", ondelete="CASCADE"))
    price = Column(Float, nullable=False)
    currency = Column(String, default="PLN")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)