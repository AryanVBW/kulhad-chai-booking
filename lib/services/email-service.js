/**
 * Email Notification Service
 * Supports multiple email providers: SendGrid, Resend, Nodemailer
 */

const EMAIL_PROVIDER = process.env.EMAIL_SERVICE_PROVIDER || 'nodemailer';
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@kulhadchai.shop';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Kulhad Chai';

let emailClient = null;

// Initialize email client based on provider
async function initializeEmailClient() {
  if (emailClient) return emailClient;

  try {
    switch (EMAIL_PROVIDER.toLowerCase()) {
      case 'sendgrid':
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(process.env.EMAIL_API_KEY);
        emailClient = {
          send: async (to, subject, html, text) => {
            await sgMail.default.send({
              to,
              from: { email: EMAIL_FROM_ADDRESS, name: EMAIL_FROM_NAME },
              subject,
              text,
              html,
            });
            return { success: true };
          },
        };
        break;

      case 'resend':
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.EMAIL_API_KEY);
        emailClient = {
          send: async (to, subject, html, text) => {
            const { data, error } = await resend.emails.send({
              from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
              to,
              subject,
              html,
              text,
            });
            if (error) throw error;
            return { success: true, id: data?.id };
          },
        };
        break;

      case 'nodemailer':
      default:
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || process.env.EMAIL_API_KEY,
            pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
          },
        });
        emailClient = {
          send: async (to, subject, html, text) => {
            const info = await transporter.sendMail({
              from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`,
              to,
              subject,
              text,
              html,
            });
            return { success: true, messageId: info.messageId };
          },
        };
        break;
    }
  } catch (error) {
    console.error('Error initializing email client:', error);
    // Fallback to no-op in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Email service not configured, using no-op mode');
      emailClient = {
        send: async (to, subject, html, text) => {
          console.log('📧 [DEV MODE] Email would be sent:', { to, subject });
          return { success: true, devMode: true };
        },
      };
    } else {
      throw error;
    }
  }

  return emailClient;
}

export const emailService = {
  /**
   * Send a generic email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(to, subject, htmlContent, metadata = {}) {
    try {
      const client = await initializeEmailClient();
      
      // Generate plain text version from HTML (simple strip)
      const textContent = htmlContent
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      const result = await client.send(to, subject, htmlContent, textContent);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  },

  /**
   * Send order created email
   * @param {Object} order - Order object
   * @param {string} customerEmail - Customer email
   * @returns {Promise<Object>} Send result
   */
  async sendOrderCreatedEmail(order, customerEmail) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const subject = `Order #${orderNumber} Placed Successfully`;
    const html = this.getOrderCreatedTemplate(order, orderNumber);

    return this.sendEmail(customerEmail, subject, html, { orderId: order.id });
  },

  /**
   * Send order status change email
   * @param {Object} order - Order object
   * @param {string} customerEmail - Customer email
   * @param {string} newStatus - New order status
   * @returns {Promise<Object>} Send result
   */
  async sendOrderStatusEmail(order, customerEmail, newStatus) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const statusLabels = {
      preparing: 'Being Prepared',
      ready: 'Ready for Pickup',
      served: 'Served',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    const statusLabel = statusLabels[newStatus] || newStatus;
    const subject = `Order #${orderNumber} - ${statusLabel}`;
    const html = this.getOrderStatusTemplate(order, orderNumber, newStatus, statusLabel);

    return this.sendEmail(customerEmail, subject, html, { orderId: order.id, status: newStatus });
  },

  /**
   * Send order ready email
   * @param {Object} order - Order object
   * @param {string} customerEmail - Customer email
   * @returns {Promise<Object>} Send result
   */
  async sendOrderReadyEmail(order, customerEmail) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const subject = `Order #${orderNumber} is Ready!`;
    const html = this.getOrderReadyTemplate(order, orderNumber);

    return this.sendEmail(customerEmail, subject, html, { orderId: order.id });
  },

  /**
   * Send order completed email
   * @param {Object} order - Order object
   * @param {string} customerEmail - Customer email
   * @returns {Promise<Object>} Send result
   */
  async sendOrderCompletedEmail(order, customerEmail) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const subject = `Thank You - Order #${orderNumber} Completed`;
    const html = this.getOrderCompletedTemplate(order, orderNumber);

    return this.sendEmail(customerEmail, subject, html, { orderId: order.id });
  },

  /**
   * Send order cancelled email
   * @param {Object} order - Order object
   * @param {string} customerEmail - Customer email
   * @returns {Promise<Object>} Send result
   */
  async sendOrderCancelledEmail(order, customerEmail) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const subject = `Order #${orderNumber} Cancelled`;
    const html = this.getOrderCancelledTemplate(order, orderNumber);

    return this.sendEmail(customerEmail, subject, html, { orderId: order.id });
  },

  // Email Templates
  getOrderCreatedTemplate(order, orderNumber) {
    const totalAmount = `₹${order.totalAmount?.toFixed(2) || '0.00'}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Placed Successfully!</h1>
          </div>
          <div class="content">
            <p>Hello ${order.customerName || 'Customer'},</p>
            <p>Thank you for your order! We've received your order and will start preparing it shortly.</p>
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
              <p><strong>Total Amount:</strong> ${totalAmount}</p>
              <p><strong>Status:</strong> Pending</p>
            </div>
            <p>We'll notify you when your order is ready for pickup.</p>
            <p>Thank you for choosing Kulhad Chai!</p>
          </div>
          <div class="footer">
            <p>Kulhad Chai - Your favorite chai place</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  getOrderStatusTemplate(order, orderNumber, status, statusLabel) {
    const totalAmount = `₹${order.totalAmount?.toFixed(2) || '0.00'}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <p>Hello ${order.customerName || 'Customer'},</p>
            <p>Your order status has been updated.</p>
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
              <p><strong>Status:</strong> ${statusLabel}</p>
              <p><strong>Total Amount:</strong> ${totalAmount}</p>
            </div>
            ${status === 'ready' ? '<p><strong>Your order is ready for pickup!</strong></p>' : ''}
            <p>Thank you for choosing Kulhad Chai!</p>
          </div>
          <div class="footer">
            <p>Kulhad Chai - Your favorite chai place</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  getOrderReadyTemplate(order, orderNumber) {
    const totalAmount = `₹${order.totalAmount?.toFixed(2) || '0.00'}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .ready-badge { background: #10b981; color: white; padding: 10px; text-align: center; font-weight: bold; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order is Ready! 🎉</h1>
          </div>
          <div class="content">
            <p>Hello ${order.customerName || 'Customer'},</p>
            <div class="ready-badge">Order #${orderNumber} is ready for pickup!</div>
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
              <p><strong>Total Amount:</strong> ${totalAmount}</p>
            </div>
            <p>Please come to collect your order. We look forward to serving you!</p>
            <p>Thank you for choosing Kulhad Chai!</p>
          </div>
          <div class="footer">
            <p>Kulhad Chai - Your favorite chai place</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  getOrderCompletedTemplate(order, orderNumber) {
    const totalAmount = `₹${order.totalAmount?.toFixed(2) || '0.00'}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You!</h1>
          </div>
          <div class="content">
            <p>Hello ${order.customerName || 'Customer'},</p>
            <p>Your order has been completed. We hope you enjoyed your meal!</p>
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
              <p><strong>Total Amount:</strong> ${totalAmount}</p>
            </div>
            <p>We'd love to see you again soon!</p>
            <p>Thank you for choosing Kulhad Chai!</p>
          </div>
          <div class="footer">
            <p>Kulhad Chai - Your favorite chai place</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  getOrderCancelledTemplate(order, orderNumber) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
          </div>
          <div class="content">
            <p>Hello ${order.customerName || 'Customer'},</p>
            <p>Your order has been cancelled.</p>
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
            </div>
            <p>If you have any questions or concerns, please contact us.</p>
            <p>Thank you for choosing Kulhad Chai!</p>
          </div>
          <div class="footer">
            <p>Kulhad Chai - Your favorite chai place</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
};

