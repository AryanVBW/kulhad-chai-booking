/**
 * SMS Notification Service
 * Supports multiple SMS providers: Twilio, AWS SNS
 */

const SMS_PROVIDER = process.env.SMS_SERVICE_PROVIDER || 'twilio';
const SMS_FROM_NUMBER = process.env.SMS_FROM_NUMBER || '';

let smsClient = null;

// Initialize SMS client based on provider
async function initializeSMSClient() {
  if (smsClient) return smsClient;

  try {
    switch (SMS_PROVIDER.toLowerCase()) {
      case 'twilio':
        const twilio = await import('twilio');
        const accountSid = process.env.SMS_ACCOUNT_SID;
        const authToken = process.env.SMS_AUTH_TOKEN;

        if (!accountSid || !authToken) {
          throw new Error('Twilio credentials not configured');
        }

        const twilioClient = twilio.default(accountSid, authToken);
        smsClient = {
          send: async (to, message) => {
            const result = await twilioClient.messages.create({
              body: message,
              from: SMS_FROM_NUMBER,
              to: to,
            });
            return { success: true, sid: result.sid };
          },
        };
        break;

      case 'aws-sns':
        const AWS = await import('aws-sdk');
        const sns = new AWS.SNS({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1',
        });
        smsClient = {
          send: async (to, message) => {
            const params = {
              Message: message,
              PhoneNumber: to,
            };
            const result = await sns.publish(params).promise();
            return { success: true, messageId: result.MessageId };
          },
        };
        break;

      default:
        throw new Error(`Unsupported SMS provider: ${SMS_PROVIDER}`);
    }
  } catch (error) {
    console.error('Error initializing SMS client:', error);
    // Fallback to no-op in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('SMS service not configured, using no-op mode');
      smsClient = {
        send: async (to, message) => {
          console.log('📱 [DEV MODE] SMS would be sent:', { to, message });
          return { success: true, devMode: true };
        },
      };
    } else {
      throw error;
    }
  }

  return smsClient;
}

export const smsService = {
  /**
   * Send a generic SMS
   * @param {string} to - Recipient phone number (E.164 format)
   * @param {string} message - SMS message
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Send result
   */
  async sendSMS(to, message, metadata = {}) {
    try {
      // Normalize phone number (ensure E.164 format)
      const normalizedPhone = this.normalizePhoneNumber(to);

      const client = await initializeSMSClient();
      const result = await client.send(normalizedPhone, message);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }
  },

  /**
   * Normalize phone number to E.164 format
   * @param {string} phone - Phone number
   * @returns {string} Normalized phone number
   */
  normalizePhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If it starts with 0, replace with country code (assuming India +91)
    if (cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.substring(1);
    }

    // If it doesn't start with country code, assume India (+91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    // Add + prefix
    return '+' + cleaned;
  },

  /**
   * Send order created SMS
   * @param {Object} order - Order object
   * @param {string} customerPhone - Customer phone number
   * @returns {Promise<Object>} Send result
   */
  async sendOrderCreatedSMS(order, customerPhone) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const totalAmount = `₹${order.totalAmount?.toFixed(2) || '0.00'}`;
    const message = `Order #${orderNumber} placed successfully! Total: ${totalAmount}. We'll notify you when it's ready. - Kulhad Chai`;

    return this.sendSMS(customerPhone, message, { orderId: order.id });
  },

  /**
   * Send order status change SMS
   * @param {Object} order - Order object
   * @param {string} customerPhone - Customer phone number
   * @param {string} newStatus - New order status
   * @returns {Promise<Object>} Send result
   */
  async sendOrderStatusSMS(order, customerPhone, newStatus) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const statusLabels = {
      preparing: 'being prepared',
      ready: 'ready for pickup',
      served: 'served',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    const statusLabel = statusLabels[newStatus] || newStatus;
    const message = `Order #${orderNumber} status: ${statusLabel}. - Kulhad Chai`;

    return this.sendSMS(customerPhone, message, { orderId: order.id, status: newStatus });
  },

  /**
   * Send order ready SMS
   * @param {Object} order - Order object
   * @param {string} customerPhone - Customer phone number
   * @returns {Promise<Object>} Send result
   */
  async sendOrderReadySMS(order, customerPhone) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const totalAmount = `₹${order.totalAmount?.toFixed(2) || '0.00'}`;
    const message = `🎉 Order #${orderNumber} is ready for pickup! Total: ${totalAmount}. - Kulhad Chai`;

    return this.sendSMS(customerPhone, message, { orderId: order.id });
  },

  /**
   * Send order completed SMS
   * @param {Object} order - Order object
   * @param {string} customerPhone - Customer phone number
   * @returns {Promise<Object>} Send result
   */
  async sendOrderCompletedSMS(order, customerPhone) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const message = `Thank you! Order #${orderNumber} completed. We hope you enjoyed your meal! - Kulhad Chai`;

    return this.sendSMS(customerPhone, message, { orderId: order.id });
  },

  /**
   * Send order cancelled SMS
   * @param {Object} order - Order object
   * @param {string} customerPhone - Customer phone number
   * @returns {Promise<Object>} Send result
   */
  async sendOrderCancelledSMS(order, customerPhone) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const message = `Order #${orderNumber} has been cancelled. If you have questions, please contact us. - Kulhad Chai`;

    return this.sendSMS(customerPhone, message, { orderId: order.id });
  },
};

