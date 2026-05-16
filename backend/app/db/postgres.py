import contextlib
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from app.core.logger import logger

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

# Async session factory
async_session = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def init_db():
    """Initialize database schemas."""
    try:
        async with engine.begin() as conn:
            # Drop all for clean reset (since we are replacing firestore and want a fresh DB for hackathon)
            # await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
            
        # Seed system agent if not exists
        from app.models.domain import UserDB
        async with async_session() as session:
            result = await session.execute(select(UserDB).where(UserDB.phone_number == "system_agent"))
            if not result.scalar_one_or_none():
                agent_user = UserDB(phone_number="system_agent", role="agent", name="AI Agent")
                session.add(agent_user)
                await session.commit()
                
        logger.info("PostgreSQL database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL: {e}")
        raise

async def get_db() -> AsyncSession:
    """Dependency for getting async DB session."""
    async with async_session() as session:
        yield session
