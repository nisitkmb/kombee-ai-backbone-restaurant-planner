-- ============================================================
-- KOMBEE AI — PostgreSQL Setup
-- Run: psql -U postgres -f setup_db.sql
-- ============================================================

CREATE DATABASE kombee_ai;
\c kombee_ai;

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120)  NOT NULL,
    email           VARCHAR(200)  NOT NULL UNIQUE,
    restaurant_name VARCHAR(200)  NOT NULL,
    restaurant_type VARCHAR(80)   NOT NULL,
    city            VARCHAR(80)   NOT NULL,
    created_at      TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(200)  NOT NULL,
    category         VARCHAR(80)   NOT NULL,
    sub_category     VARCHAR(80),
    unit             VARCHAR(20)   NOT NULL,
    price_per_unit   DECIMAL(10,2) NOT NULL,
    supplier         VARCHAR(120),
    shelf_life_days  INTEGER       DEFAULT 7,
    description      TEXT
);
CREATE INDEX idx_products_name     ON products(name);
CREATE INDEX idx_products_category ON products(category);

CREATE TABLE IF NOT EXISTS orders (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER       NOT NULL REFERENCES users(id),
    order_date   TIMESTAMP     NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    season       VARCHAR(20),
    day_of_week  VARCHAR(10),
    meal_period  VARCHAR(20)
);
CREATE INDEX idx_orders_user_id    ON orders(user_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);

CREATE TABLE IF NOT EXISTS order_details (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER       NOT NULL REFERENCES orders(id),
    product_id  INTEGER       NOT NULL REFERENCES products(id),
    quantity    DECIMAL(10,3) NOT NULL,
    unit_price  DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL
);
CREATE INDEX idx_od_order_id   ON order_details(order_id);
CREATE INDEX idx_od_product_id ON order_details(product_id);

CREATE TABLE IF NOT EXISTS stock (
    id                 SERIAL PRIMARY KEY,
    user_id            INTEGER       NOT NULL REFERENCES users(id),
    product_id         INTEGER       NOT NULL REFERENCES products(id),
    quantity_available DECIMAL(10,3) NOT NULL DEFAULT 0,
    unit               VARCHAR(20)   NOT NULL,
    updated_at         TIMESTAMP     DEFAULT NOW()
);
CREATE INDEX idx_stock_user_product ON stock(user_id, product_id);

SELECT 'Schema created successfully' AS status;
