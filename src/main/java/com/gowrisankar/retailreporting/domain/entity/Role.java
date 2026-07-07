package com.gowrisankar.retailreporting.domain.entity;

/**
 * Application roles, from least to most privileged.
 * <p>
 * Mirrors the {@code chk_users_role} CHECK constraint in
 * {@code V1__init_schema.sql} — the two must be kept in sync.
 */
public enum Role {

    /** Read-only access to core data and dashboard KPIs. */
    VIEWER,

    /** Read-only access to data plus full reporting/export capability. */
    ANALYST,

    /** Full CRUD on products, inventory, customers, and orders; read access to reports. */
    MANAGER,

    /** Full system access, including user management. */
    ADMIN
}
