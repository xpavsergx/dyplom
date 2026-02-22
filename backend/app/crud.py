from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from . import models, schemas
import uuid

async def create_route(db: AsyncSession, route: schemas.RouteCreate):
    db_route = models.TrackedRoute(
        id=uuid.uuid4(),
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

async def get_routes(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.TrackedRoute).offset(skip).limit(limit))
    return result.scalars().all()

async def delete_route(db: AsyncSession, route_id: str):
    result = await db.execute(delete(models.TrackedRoute).where(models.TrackedRoute.id == route_id))
    await db.commit()
    return result.rowcount > 0