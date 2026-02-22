import asyncio
import uuid
import random
from datetime import datetime, timedelta, date
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import TrackedRoute, PriceHistory

async def seed_data():
    async with AsyncSessionLocal() as db:
        # 1. Перевіряємо, чи є вже маршрути
        result = await db.execute(select(TrackedRoute))
        routes = result.scalars().all()

        # 2. Якщо немає - додамо один тестовий
        if not routes:
            test_route = TrackedRoute(
                id=uuid.uuid4(),
                origin="WAW",
                destination="MAD",
                departure_date=date(2026, 5, 20),
                target_price=500.0,
                check_interval=6
            )
            db.add(test_route)
            await db.commit()
            await db.refresh(test_route)
            routes = [test_route]
            print("🚀 Створено тестовий маршрут WAW -> MAD")

        # 3. Додаємо історію цін
        print(f"📊 Генерація історії для {len(routes)} маршрутів...")
        for route in routes:
            for i in range(15):
                # Імітуємо дані за останні 5 днів
                ts = datetime.utcnow() - timedelta(hours=i*8)
                price_fluctuation = random.uniform(-100, 100)
                
                history = PriceHistory(
                    id=uuid.uuid4(),
                    route_id=route.id,
                    price=max(200, route.target_price + price_fluctuation),
                    currency="PLN",
                    timestamp=ts
                )
                db.add(history)
        
        await db.commit()
        print("✅ Дані успішно додані! Тепер графіки на сайті будуть відображатися.")

if __name__ == "__main__":
    asyncio.run(seed_data())