/**
 * Push Notification Service
 * Uses Web Push API with VAPID keys
 */

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@kulhadchai.shop';

// Initialize VAPID keys
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else if (process.env.NODE_ENV !== 'development') {
  console.warn('VAPID keys not configured. Push notifications will not work.');
}

export const pushService = {
  /**
   * Generate VAPID keys (one-time setup)
   * Run: node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
   * @returns {Object} VAPID keys
   */
  generateVAPIDKeys() {
    const vapidKeys = webpush.generateVAPIDKeys();
    return {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
    };
  },

  /**
   * Subscribe a user to push notifications
   * @param {string} userId - User ID
   * @param {Object} subscription - Push subscription object
   * @returns {Promise<Object>} Saved subscription
   */
  async subscribeUser(userId, subscription) {
    const { supabase } = await import('../supabase');

    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: userId || null,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        device_info: subscription.deviceInfo || {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      // If subscription already exists, update it
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('push_subscriptions')
          .update({
            p256dh_key: subscription.keys.p256dh,
            auth_key: subscription.keys.auth,
            device_info: subscription.deviceInfo || {},
            is_active: true,
          })
          .eq('endpoint', subscription.endpoint)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating push subscription:', updateError);
          throw updateError;
        }
        return updated;
      }
      console.error('Error creating push subscription:', error);
      throw error;
    }

    return data;
  },

  /**
   * Unsubscribe a user from push notifications
   * @param {string} endpoint - Push subscription endpoint
   * @returns {Promise<Object>} Unsubscribe result
   */
  async unsubscribeUser(endpoint) {
    const { supabase } = await import('../supabase');

    const { data, error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', endpoint)
      .select()
      .single();

    if (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }

    return data;
  },

  /**
   * Send a push notification
   * @param {Object} subscription - Push subscription object
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Send result
   */
  async sendPushNotification(subscription, title, body, data = {}) {
    try {
      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📱 [DEV MODE] Push notification would be sent:', { title, body });
          return { success: true, devMode: true };
        }
        throw new Error('VAPID keys not configured');
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        data: {
          ...data,
          url: data.url || '/',
        },
      });

      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      };

      await webpush.sendNotification(pushSubscription, payload);
      return { success: true };
    } catch (error) {
      console.error('Error sending push notification:', error);

      // If subscription is invalid, mark it as inactive
      if (error.statusCode === 410 || error.statusCode === 404) {
        try {
          await this.unsubscribeUser(subscription.endpoint);
        } catch (unsubError) {
          console.error('Error unsubscribing invalid subscription:', unsubError);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to send push notification',
      };
    }
  },

  /**
   * Send push notification to a user
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data
   * @returns {Promise<Array>} Array of send results
   */
  async sendPushToUser(userId, title, body, data = {}) {
    const { supabase } = await import('../supabase');

    // Get all active subscriptions for user
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching push subscriptions:', error);
      return [];
    }

    if (!subscriptions || subscriptions.length === 0) {
      return [];
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        this.sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh_key,
              auth: sub.auth_key,
            },
          },
          title,
          body,
          data
        )
      )
    );

    return results.map((result, index) => ({
      subscription: subscriptions[index],
      success: result.status === 'fulfilled' && result.value.success,
      error: result.status === 'rejected' ? result.reason : result.value.error,
    }));
  },

  /**
   * Send order created push notification
   * @param {Object} order - Order object
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Send results
   */
  async sendOrderCreatedPush(order, userId) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const title = 'Order Placed Successfully';
    const body = `Order #${orderNumber} has been placed. We'll notify you when it's ready!`;

    return this.sendPushToUser(userId, title, body, {
      orderId: order.id,
      type: 'order_created',
    });
  },

  /**
   * Send order status change push notification
   * @param {Object} order - Order object
   * @param {string} userId - User ID
   * @param {string} newStatus - New order status
   * @returns {Promise<Array>} Send results
   */
  async sendOrderStatusPush(order, userId, newStatus) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const statusLabels = {
      preparing: 'Being Prepared',
      ready: 'Ready for Pickup',
      served: 'Served',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    const statusLabel = statusLabels[newStatus] || newStatus;
    const title = 'Order Status Updated';
    const body = `Order #${orderNumber} is now ${statusLabel.toLowerCase()}`;

    return this.sendPushToUser(userId, title, body, {
      orderId: order.id,
      type: 'order_status_changed',
      status: newStatus,
    });
  },

  /**
   * Send order ready push notification
   * @param {Object} order - Order object
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Send results
   */
  async sendOrderReadyPush(order, userId) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const title = 'Order Ready! 🎉';
    const body = `Order #${orderNumber} is ready for pickup!`;

    return this.sendPushToUser(userId, title, body, {
      orderId: order.id,
      type: 'order_ready',
    });
  },

  /**
   * Send order completed push notification
   * @param {Object} order - Order object
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Send results
   */
  async sendOrderCompletedPush(order, userId) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const title = 'Thank You!';
    const body = `Order #${orderNumber} completed. We hope you enjoyed your meal!`;

    return this.sendPushToUser(userId, title, body, {
      orderId: order.id,
      type: 'order_completed',
    });
  },

  /**
   * Send order cancelled push notification
   * @param {Object} order - Order object
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Send results
   */
  async sendOrderCancelledPush(order, userId) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const title = 'Order Cancelled';
    const body = `Order #${orderNumber} has been cancelled.`;

    return this.sendPushToUser(userId, title, body, {
      orderId: order.id,
      type: 'order_cancelled',
    });
  },
};

