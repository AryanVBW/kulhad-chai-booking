import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/payment-service';
import { paymentsService, ordersService } from '@/lib/database';
import { notificationService } from '@/lib/notification-service';

export async function POST(request) {
    try {
        const body = await request.json();
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

        // Validate required fields
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json(
                { error: 'Missing required payment details' },
                { status: 400 }
            );
        }

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Get payment record
        const payment = await paymentsService.getByRazorpayOrderId(razorpayOrderId);
        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Update payment status
        const updatedPayment = await paymentsService.updateStatus(
            payment.id,
            'captured',
            {
                razorpayPaymentId,
                razorpaySignature
            }
        );

        // Update order status to confirmed
        if (payment.order_id) {
            await ordersService.updateStatus(payment.order_id, 'confirmed');

            // Send payment confirmation notification
            try {
                const order = await ordersService.getById(payment.order_id);
                await notificationService.sendOrderNotification(
                    order,
                    'payment_success',
                    { paymentId: updatedPayment.id }
                );
            } catch (notifErr) {
                console.error('Error sending payment notification:', notifErr);
            }
        }

        return NextResponse.json({
            success: true,
            payment: {
                id: updatedPayment.id,
                status: updatedPayment.status,
                amount: updatedPayment.amount,
                currency: updatedPayment.currency
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment', details: error.message },
            { status: 500 }
        );
    }
}
