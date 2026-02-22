import asyncio
import logging
import os
from celery import Celery
from sqlalchemy import select
from datetime import datetime

# Імпорти з вашого проекту
from .database import AsyncSessionLocal
from .models import TrackedRoute, PriceHistory, User
from .amadeus_client import search_flight
from .email_service import send_price_alert

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Налаштування Celery
# Якщо ми в Docker - використовуємо імена сервісів (redis), якщо локально - localhost
BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
BACKEND_URL = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=BROKER_URL,
    backend=BACKEND_URL
)

# Налаштування розкладу (Beat) - щоб не налаштовувати окремо
celery_app.conf.beat_schedule = {
    'update-prices-every-hour': {
        'task': 'app.worker.run_price_update',
        'schedule': 3600.0,  # Запуск кожну годину (в секундах)
    },
}
celery_app.conf.timezone = 'UTC'

async def update_prices_logic():
    """
    Основна логіка: дістає маршрути з БД, перевіряє ціни та шле емейли.
    """
    logger.info("⏳ Starting price update check...")
    
    async with AsyncSessionLocal() as db:
        # 1. Отримуємо всі маршрути
        result = await db.execute(select(TrackedRoute))
        routes = result.scalars().all()
        
        logger.info(f"Found {len(routes)} routes to check.")

        for route in routes:
            try:
                # Підготовка дати для API (YYYY-MM-DD)
                date_str = route.departure_date.strftime("%Y-%m-%d")
                
                logger.info(f"Checking flight: {route.origin} -> {route.destination} on {date_str}")
                
                # 2. Запит до Amadeus API
                # (search_flight - синхронна функція, це ОК для простого воркера)
                flight_data = search_flight(route.origin, route.destination, date_str)

                if not flight_data:
                    logger.warning(f"No flight found for {route.origin}->{route.destination}")
                    continue

                current_price = float(flight_data["price"])
                currency = flight_data["currency"]

                # 3. Зберігаємо історію цін
                history_entry = PriceHistory(
                    route_id=route.id,
                    price=current_price,
                    currency=currency,
                    timestamp=datetime.utcnow()
                )
                db.add(history_entry)
                
                # 4. Перевіряємо, чи впала ціна (для відправки Email)
                if current_price <= route.target_price:
                    logger.info(f"🔥 PRICE DROP! Current: {current_price} <= Target: {route.target_price}")
                    
                    # Шукаємо власника маршруту, щоб отримати Email
                    user_result = await db.execute(select(User).where(User.id == route.user_id))
                    user = user_result.scalars().first()
                    
                    user_email = user.email if user else "unknown@example.com"
                    
                    # Відправка (імітація) листа
                    await send_price_alert(
                        to_email=user_email,
                        route_info=f"{route.origin} -> {route.destination} ({date_str})",
                        current_price=current_price,
                        target_price=route.target_price
                    )
            
            except Exception as e:
                logger.error(f"Error processing route {route.id}: {e}")
        
        # Фіксуємо зміни в базі (збереження історії)
        await db.commit()
    
    logger.info("✅ Price update finished.")

@celery_app.task(name="app.worker.run_price_update")
def run_price_update():
    """
    Обгортка для Celery.
    Використовує asyncio.run(), щоб коректно запустити асинхронний код.
    """
    try:
        asyncio.run(update_prices_logic())
    except Exception as e:
        logger.error(f"Critical error in Celery task: {e}")