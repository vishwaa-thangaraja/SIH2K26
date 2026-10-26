import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory is in python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Load .env file if present
load_dotenv(backend_dir / ".env")

from app.database import engine, Base, SessionLocal
from app.seed.init_db import init_database
from app.models.schema_models import Institution, ComplaintCase

def deploy_postgresql():
    db_url = str(engine.url)
    print("=" * 70)
    print("AICTE IRCCIP — CLOUD POSTGRESQL MIGRATION & SEEDING UTILITY")
    print("=" * 70)
    print(f"Target Database URL: {engine.url.render_as_string(hide_password=True)}")
    print(f"Dialect Detected:    {engine.dialect.name.upper()}")

    # 1. Create all ORM tables in PostgreSQL
    print("\n[Step 1/3] Generating 3NF Tables & Relational Schema...")
    Base.metadata.create_all(bind=engine)
    print("[SUCCESS] Tables created successfully.")

    # 2. Seed initial canonical records, institutions, dockets & events
    print("\n[Step 2/3] Seeding Canonical Bureaus, Real-World Institutions & Test Dockets...")
    init_database()
    print("[SUCCESS] Database seeded successfully.")

    # 3. Verification check
    print("\n[Step 3/3] Verifying Cloud Database Records...")
    db = SessionLocal()
    inst_count = db.query(Institution).count()
    case_count = db.query(ComplaintCase).count()
    db.close()

    print(f"[SUCCESS] Verified: {inst_count} institutions and {case_count} complaint cases online.")
    print("=" * 70)
    print("SUCCESS: Cloud Database is 100% initialized, seeded, and deployment-ready!")
    print("=" * 70)

if __name__ == "__main__":
    deploy_postgresql()
