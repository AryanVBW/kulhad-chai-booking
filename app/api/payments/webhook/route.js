import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payment-service';
import { paymentsService, ordersService } from '@/lib/database';

export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        // Verify webhook signature
        const payload = JSON.parse(body);
        const isValid = verifyWebhookSignature(payload, signature);

        // Log webhook
        await paymentsService.logWebhook({
            eventType: payload.event,
            razorpayPaymentId: payload.payload?.payment?.entity?.id,
            razorpayOrderId: payload.payload?.payment?.entity?.order_id,
            payload,
            signature,
            signatureVerified: isValid,
            processed: false
        });

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 400 }
            );
        }

        // Handle different webhook events
        const event = payload.event;
        const paymentEntity = payload.payload?.payment?.entity;

        if (event === 'payment.captured') {
            // Payment successful
            const payment = await paymentsService.getByRazorpayOrderId(
                paymentEntity.order_id
            );

            if (payment && payment.status !== 'captured') {
                await paymentsService.updateStatus(payment.id, 'captured', {
                    razorpayPaymentId: paymentEntity.id,
                    paymentMethod: paymentEntity.method
                });

                // Update order status
                if (payment.order_id) {
                    await ordersService.updateStatus(payment.order_id, 'confirmed');
                }
            }
        } else if (event === 'payment.failed') {
            // Payment failed
            const payment = await paymentsService.getByRazorpayOrderId(
                paymentEntity.order_id
            );

            if (payment) {
                await paymentsService.updateStatus(payment.id, 'failed', {
                    razorpayPaymentId: paymentEntity.id,
                    errorCode: paymentEntity.error_code,
                    errorDescription: paymentEntity.error_description
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
