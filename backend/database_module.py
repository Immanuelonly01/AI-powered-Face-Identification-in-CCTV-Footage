# AutomatedPersonSearch/backend/database_module.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, select
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from .config import DATABASE_URL

engine = create_engine(DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class DetectionLog(Base):
    __tablename__ = 'detection_logs'

    id = Column(Integer, primary_key=True, index=True)
    video_filename = Column(String, index=True)
    frame_number = Column(Integer)
    timestamp = Column(Float)
    similarity = Column(Float)
    match_time = Column(DateTime, default=datetime.utcnow)
    image_path = Column(String) # Relative path to the saved cropped image

def create_tables():
    """Initializes the database structure."""
    Base.metadata.create_all(bind=engine)

def log_detection(log_data):
    """Saves a single detection record to the database."""
    db = SessionLocal()
    try:
        log_entry = DetectionLog(**log_data)
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    finally:
        db.close()

def get_logs_by_video(video_filename):
    """Fetches all logs for a given video."""
    db = SessionLocal()
    try:
        stmt = select(DetectionLog).filter_by(video_filename=video_filename).order_by(DetectionLog.timestamp)
        return db.scalars(stmt).all()
    finally:
        db.close()