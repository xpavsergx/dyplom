from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Дані з docker-compose.yml (admin/admin, порт 5432)
DATABASE_URL = "postgresql+asyncpg://admin:admin@localhost:5432/flight_monitor"

# Створення двигуна (Engine)
engine = create_async_engine(DATABASE_URL, echo=True)

# Фабрика сесій (для запитів до бази)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Базовий клас для моделей
Base = declarative_base()

# Функція для отримання сесії (Dependency Injection)
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session