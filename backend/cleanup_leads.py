import asyncio
from sqlalchemy import text
from app.core.database import async_session


async def cleanup_test_leads():
    async with async_session() as db:
        # Delete leads with those emails
        result = await db.execute(
            text("""
            DELETE FROM leads 
            WHERE email IN ('divyanshawasthi90@gmail.com', 'info@mowglai.in')
        """)
        )
        await db.commit()
        print(f"Deleted leads with test emails")


if __name__ == "__main__":
    asyncio.run(cleanup_test_leads())
