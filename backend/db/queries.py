"""DB query layer — stock lookup, order history, quantity prediction."""
from __future__ import annotations
from datetime import datetime, timedelta, date
from sqlalchemy import func
from sqlalchemy.orm import Session
from .models import Product, Order, OrderDetail, Stock

# Seasonal multipliers per category per season
SEASONAL: dict[str, dict[str, float]] = {
    "summer":  {"Fruits":1.4,"Beverages":1.6,"Dairy":0.9,"Meat":0.85,"Frozen":1.3},
    "winter":  {"Dairy":1.2,"Spices":1.3,"Vegetables":1.1,"Nuts":1.2},
    "monsoon": {"Vegetables":0.8,"Seafood":0.7,"Beverages":0.9},
    "spring":  {}, "autumn":  {},
}
# Time-of-day multiplier: lunch + dinner peaks = +15%
TIME_OF_DAY_BONUS = 1.15
# Weekend multiplier: Sat + Sun spike
WEEKEND_MULTIPLIER = 1.42
# Safety stock buffer
SAFETY_STOCK = 1.20
# User behaviour multiplier (personalised vs global average)
USER_BEHAVIOUR_MULT = 1.10


def get_stock(db: Session, user_id: int, product_id: int) -> float:
    """Return current stock for a user/product from the stock table."""
    row = db.query(Stock).filter(Stock.user_id == user_id, Stock.product_id == product_id).first()
    return row.quantity_available if row else 0.0


def get_order_history(db: Session, product_id: int, days_back: int = 90) -> dict:
    cutoff = datetime.utcnow() - timedelta(days=days_back)
    row = (db.query(func.count(OrderDetail.id), func.sum(OrderDetail.quantity), func.avg(OrderDetail.quantity))
             .join(Order, Order.id == OrderDetail.order_id)
             .filter(OrderDetail.product_id == product_id, Order.order_date >= cutoff)
             .first())
    if not row or not row[0]:
        return {"order_count":0,"total_qty":0.0,"avg_qty":0.0,"orders_per_day":0.0}
    return {"order_count":int(row[0]),"total_qty":float(row[1]),"avg_qty":round(float(row[2]),2),
            "orders_per_day":round(int(row[0])/days_back,3)}


def _current_season() -> str:
    return {1:"winter",2:"winter",3:"spring",4:"spring",5:"summer",6:"summer",
            7:"monsoon",8:"monsoon",9:"monsoon",10:"autumn",11:"winter",12:"winter"}[date.today().month]


def predict_required_quantity(db: Session, product: Product, user_id: int = 1, horizon_days: int = 7) -> dict:
    """
    Prediction formula:
      avg_daily = total_90d_qty / 90
      weekend_blended = avg_daily × (5/7 + 2/7 × 1.42)
      seasonal_adj = blended × seasonal_factor[category][season]
      time_of_day_adj = seasonal_adj × 1.15          ← NEW
      user_behaviour_adj = time_of_day × 1.10         ← NEW
      predicted = user_behaviour_adj × horizon × 1.20 (safety stock)
      order_qty = max(0, predicted − current_stock)
    """
    history = get_order_history(db, product.id)
    avg_daily = history["total_qty"] / 90 if history["total_qty"] else 1.0

    # Weekend blending
    blended = avg_daily * (5/7 + 2/7 * WEEKEND_MULTIPLIER)

    # Seasonal factor
    season = _current_season()
    seasonal_factor = SEASONAL.get(season, {}).get(product.category, 1.0)
    seasonal_adj = blended * seasonal_factor

    # Time-of-day factor (lunch + dinner peaks)
    time_adj = seasonal_adj * TIME_OF_DAY_BONUS

    # User behaviour multiplier (personalised usage vs global)
    user_adj = time_adj * USER_BEHAVIOUR_MULT

    # Project over horizon + safety buffer
    raw_required = user_adj * horizon_days
    with_safety  = raw_required * SAFETY_STOCK

    current_stock   = get_stock(db, user_id, product.id)
    recommended_order = max(0.0, with_safety - current_stock)

    return {
        "product_id":         product.id,
        "product_name":       product.name,
        "category":           product.category,
        "unit":               product.unit,
        "avg_daily_usage":    round(avg_daily, 3),
        "seasonal_factor":    seasonal_factor,
        "time_of_day_factor": TIME_OF_DAY_BONUS,
        "user_behaviour":     USER_BEHAVIOUR_MULT,
        "predicted_required": round(with_safety, 2),
        "current_stock":      round(current_stock, 2),
        "recommended_order":  round(recommended_order, 2),
        "horizon_days":       horizon_days,
        "season":             season,
    }
