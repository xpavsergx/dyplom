from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from . import crud, models, schemas, auth
from .database import engine, get_db
from .amadeus_client import search_flight 

app = FastAPI(title="Flight Price Monitor API")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    print("✅ Database synced")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ENDPOINTS ---

@app.post("/register", response_model=schemas.UserResponse)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Перевірка чи існує
    result = await db.execute(select(models.User).where(models.User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- PROTECTED ENDPOINTS ---

@app.get("/check-price/")
async def check_real_price(origin: str, destination: str, date: str, current_user: models.User = Depends(auth.get_current_user)):
    """Тут авторизація опціональна, але ми додали її для прикладу"""
    result = search_flight(origin, destination, date)
    if result:
        return {"status": "success", "data": result}
    return {"status": "error", "message": "No flights found"}

@app.post("/routes/", response_model=schemas.Route)
async def create_route(route: schemas.RouteCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Створення маршруту з прив'язкою до юзера"""
    # Тут треба модифікувати crud.create_route, щоб приймати user_id, 
    # або просто створити об'єкт тут:
    import uuid
    db_route = models.TrackedRoute(
        id=uuid.uuid4(),
        user_id=current_user.id, # ПРИВ'ЯЗКА ДО КОРИСТУВАЧА
        origin=route.origin,
        destination=route.destination,
        departure_date=route.departure_date,
        target_price=route.target_price,
        check_interval=route.check_interval
    )
    db.add(db_route)
    await db.commit()
    await db.refresh(db_route)
    return db_route

@app.get("/routes/", response_model=List[schemas.Route])
async def read_routes(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Показуємо тільки маршрути поточного користувача"""
    result = await db.execute(
        select(models.TrackedRoute)
        .where(models.TrackedRoute.user_id == current_user.id) # ФІЛЬТР ПО ЮЗЕРУ
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@app.delete("/routes/{route_id}")
async def delete_route(route_id: str, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    await crud.delete_route(db, route_id) # Можна додати перевірку, чи належить маршрут юзеру
    return {"status": "success"}

@app.get("/routes/{route_id}/history")
async def get_history(route_id: str, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    result = await db.execute(
        select(models.PriceHistory)
        .where(models.PriceHistory.route_id == route_id)
        .order_by(models.PriceHistory.timestamp.asc())
    )
    return result.scalars().all()