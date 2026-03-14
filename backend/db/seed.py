"""
Database Seed Script — run with: python -m db.seed
Generates: 10 users · 50,000 products · 20,000 orders · ~140K order_details · stock entries
"""
from __future__ import annotations
import os, random, time
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from .models import User, Product, Order, OrderDetail, Stock, SessionLocal, create_all

fake = Faker("en_IN")
random.seed(42)

CATEGORIES = {
    "Vegetables": {"unit":"kg",    "price":(20,120),   "shelf":7  },
    "Fruits":     {"unit":"kg",    "price":(40,300),   "shelf":5  },
    "Dairy":      {"unit":"kg",    "price":(50,600),   "shelf":3  },
    "Grains":     {"unit":"kg",    "price":(30,200),   "shelf":180},
    "Pulses":     {"unit":"kg",    "price":(80,250),   "shelf":365},
    "Spices":     {"unit":"g",     "price":(5,50),     "shelf":730},
    "Oils":       {"unit":"L",     "price":(100,500),  "shelf":365},
    "Meat":       {"unit":"kg",    "price":(200,800),  "shelf":2  },
    "Seafood":    {"unit":"kg",    "price":(300,1200), "shelf":1  },
    "Beverages":  {"unit":"L",     "price":(30,200),   "shelf":30 },
    "Bakery":     {"unit":"piece", "price":(5,50),     "shelf":3  },
    "Sauces":     {"unit":"mL",    "price":(1,10),     "shelf":180},
    "Sweeteners": {"unit":"kg",    "price":(40,300),   "shelf":365},
    "Nuts":       {"unit":"kg",    "price":(500,2000), "shelf":180},
    "Frozen":     {"unit":"kg",    "price":(100,600),  "shelf":90 },
}
SEASONS = {1:"winter",2:"winter",3:"spring",4:"spring",5:"summer",6:"summer",
           7:"monsoon",8:"monsoon",9:"monsoon",10:"autumn",11:"winter",12:"winter"}
DAYS    = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
MEALS   = ["breakfast","lunch","dinner","all_day"]
REST_TYPES = ["veg","non-veg","multi-cuisine","south-indian","north-indian","chinese"]
CITIES  = ["Mumbai","Delhi","Bengaluru","Hyderabad","Ahmedabad","Chennai","Pune","Kolkata"]


def run_seed():
    print("=" * 55)
    print("  Kombee AI — Database Seed")
    print("=" * 55)
    t0 = time.time()
    create_all()
    db: Session = SessionLocal()
    try:
        # ── Users ──────────────────────────────────────────────
        print("→ Seeding 10 users...")
        users = []
        for i in range(10):
            u = User(name=fake.name(), email=f"user{i+1}@kombee-ai.com",
                     restaurant_name=f"{fake.last_name()} {random.choice(['Kitchen','Dhaba','Bistro','Cafe'])}",
                     restaurant_type=random.choice(REST_TYPES), city=random.choice(CITIES),
                     created_at=fake.date_time_between(start_date="-3y", end_date="-1y"))
            db.add(u); users.append(u)
        db.flush()
        print(f"  ✓ {len(users)} users")

        # ── Products ───────────────────────────────────────────
        print("→ Seeding 50,000 products...")
        cat_names = list(CATEGORIES.keys())
        per_cat   = 50_000 // len(cat_names)
        products  = []
        for cat_name in cat_names:
            cat = CATEGORIES[cat_name]
            for i in range(per_cat):
                p = Product(
                    name=f"{fake.word().capitalize()} {cat_name.rstrip('s')} #{i+1}"[:200],
                    category=cat_name, sub_category=fake.word().capitalize(),
                    unit=cat["unit"], price_per_unit=round(random.uniform(*cat["price"]),2),
                    supplier=fake.company()[:120], shelf_life_days=cat["shelf"],
                    description=f"Fresh {cat_name.lower()} from trusted supplier.")
                db.add(p); products.append(p)
        db.flush()
        print(f"  ✓ {len(products):,} products")

        # ── Orders + Details ───────────────────────────────────
        print("→ Seeding 20,000 orders + details...")
        start_date = datetime.utcnow() - timedelta(days=730)
        total_details = 0
        for u_idx, user in enumerate(users):
            for _ in range(2000):
                order_date = start_date + timedelta(seconds=random.randint(0, 730*86400))
                n_items    = random.randint(5, 15)
                picked     = random.sample(products, n_items)
                total      = 0.0
                order = Order(user_id=user.id, order_date=order_date, total_amount=0,
                              season=SEASONS[order_date.month], day_of_week=DAYS[order_date.weekday()],
                              meal_period=random.choice(MEALS))
                db.add(order); db.flush()
                for product in picked:
                    qty   = round(random.uniform(0.5, 20.0), 2)
                    up    = round(product.price_per_unit * random.uniform(0.9, 1.1), 2)
                    tp    = round(qty * up, 2); total += tp
                    db.add(OrderDetail(order_id=order.id, product_id=product.id,
                                       quantity=qty, unit_price=up, total_price=tp))
                    total_details += 1
                order.total_amount = round(total, 2)
            db.commit()
            print(f"  ✓ User {u_idx+1}/10 done — {total_details:,} detail rows so far")

        # ── Stock ──────────────────────────────────────────────
        print("→ Seeding stock table...")
        for user in users:
            sample = random.sample(products, 200)
            for product in sample:
                db.add(Stock(user_id=user.id, product_id=product.id,
                             quantity_available=round(random.uniform(0, 50), 2),
                             unit=product.unit))
        db.commit()
        print(f"  ✓ {len(users)*200:,} stock entries")

    except Exception as e:
        db.rollback(); raise e
    finally:
        db.close()

    print(f"\n✅ Seed done in {round(time.time()-t0,1)}s")
    print("=" * 55)


if __name__ == "__main__":
    run_seed()
