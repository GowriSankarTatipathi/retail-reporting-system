-- V2__seed_reference_data.sql
-- Reference/master data: product categories and demo user accounts (one per role).
--
-- IMPORTANT: the four user rows below are DEMO/DEV-ONLY seed accounts so the API can be
-- exercised immediately after `docker compose up`. Passwords are documented in
-- docs/api.md and README.md purely for local evaluation. Rotate or delete these accounts
-- before any non-local deployment (see SECURITY.md).

INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Consumer electronics: audio, accessories, small devices'),
    ('Home & Kitchen', 'Kitchenware, small appliances, home goods'),
    ('Apparel', 'Clothing and footwear'),
    ('Office Supplies', 'Stationery, organization, and office equipment'),
    ('Sports & Outdoors', 'Fitness, camping, and outdoor gear');

-- Password hashes are BCrypt (strength 10). Plaintext demo passwords:
--   admin@retail-reporting.local   -> Admin@12345
--   manager@retail-reporting.local -> Manager@12345
--   analyst@retail-reporting.local -> Analyst@12345
--   viewer@retail-reporting.local  -> Viewer@12345
INSERT INTO users (email, password_hash, full_name, role, enabled) VALUES
    ('admin@retail-reporting.local',   '$2b$10$94gcgrOEnQencNhRClmYSO7/BCbsJ.Kcw4hsVsYeCXDsD7WvXUvB6', 'System Administrator', 'ADMIN',   TRUE),
    ('manager@retail-reporting.local', '$2b$10$1ZWUy.AgNYye66sx.ubJr.oNK4OffXHojqRleVLiCeZNh1Q2L7P96', 'Store Manager',       'MANAGER', TRUE),
    ('analyst@retail-reporting.local', '$2b$10$oURFhgekWDHrqYgt0.nFYeonefDgqlC4jJrS3szvRTY6btls6RQbe', 'Data Analyst',        'ANALYST', TRUE),
    ('viewer@retail-reporting.local',  '$2b$10$XT6jmgilvgobvF3KCuH9leQ5S7nX/UoywN1//JyJWP28Nc8gXHlg6', 'Read Only Viewer',    'VIEWER',  TRUE);
