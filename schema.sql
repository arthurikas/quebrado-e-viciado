-- Database Schema for Normalizze Occupational Health System

-- 1. Evaluated Persons (Employees)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    sex CHAR(1) CHECK (sex IN ('M', 'F', 'O')),
    age INTEGER NOT NULL,
    city VARCHAR(255),
    job_function VARCHAR(255) NOT NULL,
    sector_parish VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Evaluations (Sessions)
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    evaluation_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- 'COMPLETED'
    notes TEXT
);

-- 3. PROART Data
-- Storing raw answers in JSONB for flexibility, but could be normalized.
-- Here we store the calculated scores for quick reporting.
CREATE TABLE proart_results (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id) ON DELETE CASCADE,
    
    -- Calculated Scores (Averages)
    score_organization_work DECIMAL(5, 2), -- Scale 1 (Sum / 13)
    score_management_style DECIMAL(5, 2),  -- Scale 2 (Sum / 21)
    score_mental_suffering DECIMAL(5, 2),  -- Scale 3 (Sum / 28)
    score_work_damages DECIMAL(5, 2),      -- Scale 4 (Sum / 23)
    
    -- Raw Data (JSON format recommended for flexible questionnaire items)
    -- Structure: { "item_1": 1, "item_2": 5, ... }
    raw_responses JSONB
);

-- 4. AEP Operational Data
CREATE TABLE aep_results (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id) ON DELETE CASCADE,
    
    -- Compliance Percentages (0-100)
    compliance_posture DECIMAL(5, 2),
    compliance_furniture DECIMAL(5, 2),
    compliance_environment DECIMAL(5, 2),
    compliance_work_org DECIMAL(5, 2),
    compliance_transport DECIMAL(5, 2),
    compliance_machines DECIMAL(5, 2),
    
    -- Raw Data
    -- Structure: { "posture": { "q1": "YES", "q2": "NA" }, ... }
    raw_responses JSONB -- Stores the raw answer for each item
);

-- Companies Table (Multi-tenancy)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sectors Table (Dynamic Structure)
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table (Cargos)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updated Employees Table
-- Note: In a real migration we would migrate data from old columns to new tables
-- Here we redefine the structure for the "Target State"
ALTER TABLE employees 
    ADD COLUMN company_id INTEGER REFERENCES companies(id),
    ADD COLUMN sector_id INTEGER REFERENCES sectors(id),
    ADD COLUMN role_id INTEGER REFERENCES roles(id),
    ADD COLUMN admission_date DATE, -- For Tenure (Tempo de Casa)
    DROP COLUMN IF EXISTS sector_parish, -- Replaced by sector_id
    DROP COLUMN IF EXISTS job_function;  -- Replaced by role_id

-- Indexes for frequent queries and filtering
CREATE INDEX idx_evaluations_employee ON evaluations(employee_id);
CREATE INDEX idx_evaluations_date ON evaluations(evaluation_date);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_sector ON employees(sector_id);
CREATE INDEX idx_employees_role ON employees(role_id);

-- 5. Audit Logs (System Traceability)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    user_id INTEGER, -- Optional: link to user table if exists, or store username string
    username VARCHAR(255)
);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- 6. Users (Authentication & Authorization)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK(role IN ('ADMIN', 'COLABORADOR')) NOT NULL,
    company_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
