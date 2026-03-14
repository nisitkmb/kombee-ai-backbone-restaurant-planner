"""SQLAlchemy ORM models — users, products, orders, order_details, stock."""
from __future__ import annotations
import os
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, create_engine, Index
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/kombee_ai")


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(120), nullable=False)
    email           = Column(String(200), unique=True, nullable=False)
    restaurant_name = Column(String(200), nullable=False)
    restaurant_type = Column(String(80), nullable=False)
    city            = Column(String(80), nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    orders          = relationship("Order", back_populates="user", lazy="dynamic")


class Product(Base):
    __tablename__ = "products"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(200), nullable=False, index=True)
    category        = Column(String(80), nullable=False, index=True)
    sub_category    = Column(String(80))
    unit            = Column(String(20), nullable=False)
    price_per_unit  = Column(Float, nullable=False)
    supplier        = Column(String(120))
    shelf_life_days = Column(Integer, default=7)
    description     = Column(Text)
    __table_args__  = (Index("ix_products_name_cat", "name", "category"),)


class Order(Base):
    __tablename__ = "orders"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    order_date   = Column(DateTime, nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    season       = Column(String(20))
    day_of_week  = Column(String(10))
    meal_period  = Column(String(20))
    user         = relationship("User", back_populates="orders")
    details      = relationship("OrderDetail", back_populates="order", lazy="joined")


class OrderDetail(Base):
    __tablename__ = "order_details"
    id          = Column(Integer, primary_key=True, index=True)
    order_id    = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id  = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity    = Column(Float, nullable=False)
    unit_price  = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    order       = relationship("Order", back_populates="details")
    product     = relationship("Product")


class Stock(Base):
    """Current stock level per user per product."""
    __tablename__ = "stock"
    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id         = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity_available = Column(Float, nullable=False, default=0.0)
    unit               = Column(String(20), nullable=False)
    updated_at         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__     = (Index("ix_stock_user_product", "user_id", "product_id"),)


engine       = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all():
    Base.metadata.create_all(bind=engine)
