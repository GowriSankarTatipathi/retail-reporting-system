-- V1__init_schema.sql
-- Core normalized schema for the Retail Reporting System.
-- Design notes:
--   * All monetary columns use NUMERIC(12,2) to avoid floating-point rounding errors.
--   * created_at/updated_at columns support auditability and are set by the application layer.
--   * CHECK constraints enforce domain invariants at the database level (defense in depth,
--     not just application-level validation).

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER'))
);

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    CONSTRAINT uq_categories_name UNIQUE (name)
);

CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    sku         VARCHAR(50)  NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT       NOT NULL,
    price       NUMERIC(12, 2) NOT NULL,
    cost_price  NUMERIC(12, 2) NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT chk_products_price CHECK (price >= 0),
    CONSTRAINT chk_products_cost_price CHECK (cost_price >= 0)
);

CREATE TABLE inventory (
    id                 BIGSERIAL PRIMARY KEY,
    product_id         BIGINT    NOT NULL,
    quantity_on_hand   INTEGER   NOT NULL DEFAULT 0,
    reorder_level      INTEGER   NOT NULL DEFAULT 10,
    warehouse_location VARCHAR(100),
    updated_at         TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_inventory_product UNIQUE (product_id),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT chk_inventory_qty CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_inventory_reorder CHECK (reorder_level >= 0)
);

CREATE TABLE customers (
    id         BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(30),
    address    VARCHAR(255),
    city       VARCHAR(100),
    state      VARCHAR(100),
    zip_code   VARCHAR(20),
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT uq_customers_email UNIQUE (email)
);

CREATE TABLE orders (
    id           BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT       NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    order_date   TIMESTAMP    NOT NULL DEFAULT now(),
    created_at   TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT chk_orders_status CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0)
);

CREATE TABLE order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity   INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal   NUMERIC(12, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT chk_order_items_qty CHECK (quantity > 0),
    CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_order_items_subtotal CHECK (subtotal >= 0)
);

-- Indexes supporting the query patterns documented in docs/database.md
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_active ON products (active);
CREATE INDEX idx_products_name_lower ON products (LOWER(name));
CREATE INDEX idx_inventory_quantity_on_hand ON inventory (quantity_on_hand);
CREATE INDEX idx_customers_last_name_lower ON customers (LOWER(last_name));
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_order_date ON orders (order_date);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- View: products currently at or below their reorder level (low-stock alerts)
CREATE VIEW v_low_stock_products AS
SELECT p.id          AS product_id,
       p.sku,
       p.name         AS product_name,
       c.name         AS category_name,
       i.quantity_on_hand,
       i.reorder_level,
       i.warehouse_location
FROM products p
         JOIN inventory i ON i.product_id = p.id
         JOIN categories c ON c.id = p.category_id
WHERE p.active = TRUE
  AND i.quantity_on_hand <= i.reorder_level;

-- View: denormalized order summary used by reporting queries
CREATE VIEW v_order_summary AS
SELECT o.id                                   AS order_id,
       o.status,
       o.order_date,
       o.total_amount,
       cu.id                                  AS customer_id,
       cu.first_name || ' ' || cu.last_name   AS customer_name,
       cu.email                               AS customer_email
FROM orders o
         JOIN customers cu ON cu.id = o.customer_id;
