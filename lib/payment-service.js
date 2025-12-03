/**
 * Payment Service - Razorpay Integration
 * Handles payment creation, verification, and management
 */

import crypto from 'crypto';

/**
 * Razorpay configuration
 */
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn('Razorpay credentials not configured. Payment features will not work.');
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(options) {
    const {
        amount, // in paise (100 paise = 1 INR)
        currency = 'INR',
        receipt,
        notes = {}
    } = options;

    try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
            },
            body: JSON.stringify({
                amount,
                currency,
                receipt,
                notes
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.description || 'Failed to create Razorpay order');
        }

        const order = await response.json();
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
    try {
        const text = `${orderId}|${paymentId}`;
        const generated_signature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generated_signature === signature;
    } catch (error) {
        console.error('Error verifying payment signature:', error);
        return false;
    }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload, signature) {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPaymentDetails(paymentId) {
    try {
        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.description || 'Failed to fetch payment details');
        }

        const payment = await response.json();
        return payment;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw error;
    }
}

/**
 * Capture payment (for authorized payments)
 */
export async function capturePayment(paymentId, amount, currency = 'INR') {
    try {
        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
            },
            body: JSON.stringify({
                amount,
                currency
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.description || 'Failed to capture payment');
        }

        const payment = await response.json();
        return payment;
    } catch (error) {
        console.error('Error capturing payment:', error);
        throw error;
    }
}

/**
 * Create refund
 */
export async function createRefund(paymentId, options = {}) {
    const {
        amount, // Optional: partial refund amount in paise
        notes = {},
        speed = 'normal' // normal or optimum
    } = options;

    try {
        const body = {
            speed,
            notes
        };

        if (amount) {
            body.amount = amount;
        }

        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.description || 'Failed to create refund');
        }

        const refund = await response.json();
        return refund;
    } catch (error) {
        console.error('Error creating refund:', error);
        throw error;
    }
}

/**
 * Fetch refund details
 */
export async function fetchRefundDetails(refundId) {
    try {
        const response = await fetch(`https://api.razorpay.com/v1/refunds/${refundId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.description || 'Failed to fetch refund details');
        }

        const refund = await response.json();
        return refund;
    } catch (error) {
        console.error('Error fetching refund details:', error);
        throw error;
    }
}

/**
 * Convert amount to paise (Razorpay uses paise)
 */
export function toPaise(amount) {
    return Math.round(amount * 100);
}

/**
 * Convert paise to rupees
 */
export function toRupees(paise) {
    return paise / 100;
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency
    }).format(amount);
}

/**
 * Payment status helpers
 */
export const PaymentStatus = {
    CREATED: 'created',
    AUTHORIZED: 'authorized',
    CAPTURED: 'captured',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIAL_REFUND: 'partial_refund'
};

/**
 * Check if Razorpay is configured
 */
export function isRazorpayConfigured() {
    return !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}
