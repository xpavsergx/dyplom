from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import date, datetime
from typing import List, Optional

# --- User & Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Route Schemas (ті самі, що були) ---
class RouteBase(BaseModel):
    origin: str
    destination: str
    departure_date: date
    target_price: float
    check_interval: int = 6

class RouteCreate(RouteBase):
    pass

class Route(RouteBase):
    id: UUID
    created_at: datetime
    # owner_id: UUID  <-- Можна додати, якщо треба повертати ID власника

    class Config:
        from_attributes = True

class PriceHistory(BaseModel):
    id: UUID
    price: float
    currency: str
    timestamp: datetime

    class Config:   
        from_attributes = True