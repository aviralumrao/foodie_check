from sqlalchemy import Column, String, JSON, DateTime, Integer, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    front_image_url = Column(String, nullable=False)
    back_image_url = Column(String, nullable=False)
    raw_ocr = Column(JSON, nullable=True)
    rules_result = Column(JSON, nullable=True)
    passed = Column(Integer, default=0)
    needs_review = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    overall_status = Column(SQLEnum(ComplianceStatus), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
