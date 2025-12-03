import { NextResponse } from 'next/server';
import { createRazorpayOrder, toPaise } from '@/lib/payment-service';
import { paymentsService, ordersService } from '@/lib/database';

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderId, customerName, customerEmail, customerPhone } = body;

        // Validate required fields
        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Fetch order details
        const order = await ordersService.getById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Create Razorpay order
        const amountInPaise = toPaise(order.totalAmount);
        const razorpayOrder = await createRazorpayOrder({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${orderId}`,
            notes: {
                orderId,
                tableId: order.tableId
            }
        });

        // Save payment record
        const payment = await paymentsService.create({
            orderId,
            razorpayOrderId: razorpayOrder.id,
            amount: order.totalAmount,
            currency: 'INR',
            status: 'created',
            customerName,
            customerEmail,
            customerPhone,
            notes: {
                tableId: order.tableId
            }
        });

        return NextResponse.json({
            success: true,
            payment: {
                id: payment.id,
                razorpayOrderId: razorpayOrder.id,
                amount: order.totalAmount,
                currency: 'INR'
            },
            razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json(
            { error: 'Failed to create payment', details: error.message },
            { status: 500 }
        );
    }
}
