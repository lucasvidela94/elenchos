-- Create tables for Elenchos

-- Municipalities table
CREATE TABLE IF NOT EXISTS municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(42) UNIQUE NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Validators table
CREATE TABLE IF NOT EXISTS validators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registries table
CREATE TABLE IF NOT EXISTS registries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('activity', 'expense', 'contract', 'project')),
    data JSONB NOT NULL,
    documents TEXT[],
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'on_chain')),
    hash VARCHAR(64),
    tx_hash VARCHAR(66),
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP WITH TIME ZONE,
    validated_by UUID REFERENCES validators(id),
    observations TEXT
);

-- Validations table
CREATE TABLE IF NOT EXISTS validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_id UUID NOT NULL REFERENCES registries(id),
    validator_id UUID NOT NULL REFERENCES validators(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject')),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_registries_municipality ON registries(municipality_id);
CREATE INDEX IF NOT EXISTS idx_registries_type ON registries(type);
CREATE INDEX IF NOT EXISTS idx_registries_status ON registries(status);
CREATE INDEX IF NOT EXISTS idx_registries_created_at ON registries(created_at);
CREATE INDEX IF NOT EXISTS idx_validations_registry ON validations(registry_id);
CREATE INDEX IF NOT EXISTS idx_registries_data ON registries USING GIN (data);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_municipalities_updated_at BEFORE UPDATE ON municipalities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registries_updated_at BEFORE UPDATE ON registries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
