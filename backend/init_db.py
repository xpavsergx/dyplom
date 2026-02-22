import asyncio
from app.database import engine, Base
from app.models import User, TrackedRoute, PriceSnapshot

async def init_models():
    async with engine.begin() as conn:
        # Видаляє старі таблиці (якщо треба очистити)
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Створює нові таблиці
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_models())