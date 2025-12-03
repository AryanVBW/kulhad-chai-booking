-- Payments Schema Migration
-- Creates tables for payment tracking and management

-- ============================================
-- PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Razorpay IDs
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_signature VARCHAR(512),
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded', 'partial_refund')),
  payment_method VARCHAR(50),
  
  -- Customer details
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Additional data
  notes JSONB,
  error_code VARCHAR(100),
  error_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email) WHERE customer_email IS NOT NULL;

-- ============================================
-- PAYMENT REFUNDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  razorpay_refund_id VARCHAR(255) UNIQUE NOT NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  reason TEXT,
  notes JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON payment_refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON payment_refunds(status);

-- ============================================
-- PAYMENT WEBHOOKS LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  payload JSONB NOT NULL,
  signature VARCHAR(512),
  signature_verified BOOLEAN DEFAULT FALSE,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON payment_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON payment_webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON payment_webhook_logs(processed);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PAYMENT STATUS ENUM (for validation)
-- ============================================

-- Valid payment statuses:
-- 'created' - Payment order created
-- 'authorized' - Payment authorized but not captured
-- 'captured' - Payment successfully captured
-- 'failed' - Payment failed
-- 'refunded' - Payment refunded
-- 'partial_refund' - Partially refunded

COMMENT ON COLUMN payments.status IS 'Payment status: created, authorized, captured, failed, refunded, partial_refund';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay order ID (order_xxxxx)';
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID (pay_xxxxx)';
COMMENT ON COLUMN payments.razorpay_signature IS 'HMAC SHA256 signature for verification';
