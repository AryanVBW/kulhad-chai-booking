import { supabase } from './supabase';
import { emailService } from './services/email-service';
import { smsService } from './services/sms-service';
import { pushService } from './services/push-service';

// Notification Service
export const notificationService = {
  /**
   * Get notification preferences for a user or customer
   * @param {string} userId - User ID (optional)
   * @param {string} customerPhone - Customer phone number (optional)
   * @param {string} customerEmail - Customer email (optional)
   * @returns {Promise<Object>} Notification preferences
   */
  async getPreferences({ userId, customerPhone, customerEmail } = {}) {
    let query = supabase.from('notification_preferences').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (customerPhone) {
      query = query.eq('customer_phone', customerPhone);
    } else if (customerEmail) {
      query = query.eq('customer_email', customerEmail);
    } else {
      throw new Error('Must provide userId, customerPhone, or customerEmail');
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') {
      // No preferences found, return default preferences
      return this.getDefaultPreferences();
    }

    if (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }

    return this.normalizePreferences(data);
  },

  /**
   * Get default notification preferences
   * @returns {Object} Default preferences
   */
  getDefaultPreferences() {
    return {
      orderCreatedEmail: true,
      orderCreatedSms: true,
      orderCreatedPush: true,
      orderCreatedInApp: true,
      orderStatusChangedEmail: true,
      orderStatusChangedSms: false,
      orderStatusChangedPush: true,
      orderStatusChangedInApp: true,
      orderReadyEmail: true,
      orderReadySms: true,
      orderReadyPush: true,
      orderReadyInApp: true,
      orderPreparingEmail: false,
      orderPreparingSms: false,
      orderPreparingPush: true,
      orderPreparingInApp: true,
      orderServedEmail: false,
      orderServedSms: false,
      orderServedPush: false,
      orderServedInApp: true,
      orderCompletedEmail: true,
      orderCompletedSms: false,
      orderCompletedPush: false,
      orderCompletedInApp: true,
      orderCancelledEmail: true,
      orderCancelledSms: true,
      orderCancelledPush: true,
      orderCancelledInApp: true,
    };
  },

  /**
   * Normalize database preferences to camelCase
   */
  normalizePreferences(data) {
    if (!data) return this.getDefaultPreferences();

    return {
      id: data.id,
      userId: data.user_id || undefined,
      customerPhone: data.customer_phone || undefined,
      customerEmail: data.customer_email || undefined,
      orderCreatedEmail: data.order_created_email ?? true,
      orderCreatedSms: data.order_created_sms ?? true,
      orderCreatedPush: data.order_created_push ?? true,
      orderCreatedInApp: data.order_created_in_app ?? true,
      orderStatusChangedEmail: data.order_status_changed_email ?? true,
      orderStatusChangedSms: data.order_status_changed_sms ?? false,
      orderStatusChangedPush: data.order_status_changed_push ?? true,
      orderStatusChangedInApp: data.order_status_changed_in_app ?? true,
      orderReadyEmail: data.order_ready_email ?? true,
      orderReadySms: data.order_ready_sms ?? true,
      orderReadyPush: data.order_ready_push ?? true,
      orderReadyInApp: data.order_ready_in_app ?? true,
      orderPreparingEmail: data.order_preparing_email ?? false,
      orderPreparingSms: data.order_preparing_sms ?? false,
      orderPreparingPush: data.order_preparing_push ?? true,
      orderPreparingInApp: data.order_preparing_in_app ?? true,
      orderServedEmail: data.order_served_email ?? false,
      orderServedSms: data.order_served_sms ?? false,
      orderServedPush: data.order_served_push ?? false,
      orderServedInApp: data.order_served_in_app ?? true,
      orderCompletedEmail: data.order_completed_email ?? true,
      orderCompletedSms: data.order_completed_sms ?? false,
      orderCompletedPush: data.order_completed_push ?? false,
      orderCompletedInApp: data.order_completed_in_app ?? true,
      orderCancelledEmail: data.order_cancelled_email ?? true,
      orderCancelledSms: data.order_cancelled_sms ?? true,
      orderCancelledPush: data.order_cancelled_push ?? true,
      orderCancelledInApp: data.order_cancelled_in_app ?? true,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create or update notification preferences
   * @param {Object} preferences - Preferences to save
   * @returns {Promise<Object>} Saved preferences
   */
  async updatePreferences(preferences) {
    const {
      userId,
      customerPhone,
      customerEmail,
      ...prefData
    } = preferences;

    // Convert camelCase to snake_case for database
    const dbData = {
      ...(userId && { user_id: userId }),
      ...(customerPhone && { customer_phone: customerPhone }),
      ...(customerEmail && { customer_email: customerEmail }),
      order_created_email: prefData.orderCreatedEmail,
      order_created_sms: prefData.orderCreatedSms,
      order_created_push: prefData.orderCreatedPush,
      order_created_in_app: prefData.orderCreatedInApp,
      order_status_changed_email: prefData.orderStatusChangedEmail,
      order_status_changed_sms: prefData.orderStatusChangedSms,
      order_status_changed_push: prefData.orderStatusChangedPush,
      order_status_changed_in_app: prefData.orderStatusChangedInApp,
      order_ready_email: prefData.orderReadyEmail,
      order_ready_sms: prefData.orderReadySms,
      order_ready_push: prefData.orderReadyPush,
      order_ready_in_app: prefData.orderReadyInApp,
      order_preparing_email: prefData.orderPreparingEmail,
      order_preparing_sms: prefData.orderPreparingSms,
      order_preparing_push: prefData.orderPreparingPush,
      order_preparing_in_app: prefData.orderPreparingInApp,
      order_served_email: prefData.orderServedEmail,
      order_served_sms: prefData.orderServedSms,
      order_served_push: prefData.orderServedPush,
      order_served_in_app: prefData.orderServedInApp,
      order_completed_email: prefData.orderCompletedEmail,
      order_completed_sms: prefData.orderCompletedSms,
      order_completed_push: prefData.orderCompletedPush,
      order_completed_in_app: prefData.orderCompletedInApp,
      order_cancelled_email: prefData.orderCancelledEmail,
      order_cancelled_sms: prefData.orderCancelledSms,
      order_cancelled_push: prefData.orderCancelledPush,
      order_cancelled_in_app: prefData.orderCancelledInApp,
    };

    // Check if preferences exist
    let query = supabase.from('notification_preferences').select('id');
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (customerPhone) {
      query = query.eq('customer_phone', customerPhone);
    } else if (customerEmail) {
      query = query.eq('customer_email', customerEmail);
    }

    const { data: existing } = await query.single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(dbData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification preferences:', error);
        throw error;
      }
      result = data;
    }

    return this.normalizePreferences(result);
  },

  /**
   * Create a notification record
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    const {
      userId,
      orderId,
      type,
      title,
      message,
      channel,
      metadata = {},
    } = notificationData;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId || null,
        order_id: orderId || null,
        type,
        title,
        message,
        channel,
        metadata,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id || undefined,
      orderId: data.order_id || undefined,
      type: data.type,
      title: data.title,
      message: data.message,
      channel: data.channel,
      status: data.status,
      metadata: data.metadata || {},
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
      errorMessage: data.error_message || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Send a notification via the specified channel
   * @param {string} notificationId - Notification ID
   * @param {string} channel - Channel to send via
   * @param {Object} options - Additional options (email, phone, push subscription, etc.)
   * @returns {Promise<Object>} Updated notification
   */
  async sendNotification(notificationId, channel, options = {}) {
    // Get notification
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      throw new Error('Notification not found');
    }

    try {
      let result;
      const now = new Date().toISOString();

      switch (channel) {
        case 'email':
          if (!options.email) {
            throw new Error('Email address required for email notifications');
          }
          result = await emailService.sendEmail(
            options.email,
            notification.title,
            notification.message,
            notification.metadata
          );
          break;

        case 'sms':
          if (!options.phone) {
            throw new Error('Phone number required for SMS notifications');
          }
          result = await smsService.sendSMS(
            options.phone,
            notification.message,
            notification.metadata
          );
          break;

        case 'push':
          if (!options.subscription) {
            throw new Error('Push subscription required for push notifications');
          }
          result = await pushService.sendPushNotification(
            options.subscription,
            notification.title,
            notification.message,
            notification.metadata
          );
          break;

        case 'in_app':
          // In-app notifications are already created, just mark as sent
          result = { success: true };
          break;

        default:
          throw new Error(`Unknown channel: ${channel}`);
      }

      // Update notification status
      const { data: updated, error: updateError } = await supabase
        .from('notifications')
        .update({
          status: result.success ? 'sent' : 'failed',
          sent_at: result.success ? now : null,
          error_message: result.success ? null : result.error || 'Unknown error',
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating notification status:', updateError);
      }

      return {
        id: updated.id,
        status: updated.status,
        sentAt: updated.sent_at ? new Date(updated.sent_at) : undefined,
        errorMessage: updated.error_message || undefined,
      };
    } catch (error) {
      // Update notification with error
      await supabase
        .from('notifications')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', notificationId);

      throw error;
    }
  },

  /**
   * Send order-related notifications
   * @param {Object} order - Order object
   * @param {string} eventType - Event type (order_created, order_status_changed, etc.)
   * @param {Object} options - Additional options (previousStatus, etc.)
   * @returns {Promise<Array>} Array of created notifications
   */
  async sendOrderNotification(order, eventType, options = {}) {
    const notifications = [];

    // Determine notification type based on event and order status
    let notificationType = eventType;
    if (eventType === 'order_status_changed') {
      // Map status to specific notification type
      const statusMap = {
        preparing: 'order_preparing',
        ready: 'order_ready',
        served: 'order_served',
        completed: 'order_completed',
        cancelled: 'order_cancelled',
      };
      notificationType = statusMap[order.status] || 'order_status_changed';
    }

    // Get preferences
    const preferences = await this.getPreferences({
      userId: order.userId,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
    });

    // Generate notification content
    const { title, message } = this.generateOrderNotificationContent(
      order,
      notificationType,
      options
    );

    // Determine which channels to use based on preferences
    const preferenceKey = this.getPreferenceKey(notificationType);
    const channels = [];

    if (preferences[`${preferenceKey}Email`] && order.customerEmail) {
      channels.push({ channel: 'email', email: order.customerEmail });
    }
    if (preferences[`${preferenceKey}Sms`] && order.customerPhone) {
      channels.push({ channel: 'sms', phone: order.customerPhone });
    }
    if (preferences[`${preferenceKey}Push`] && order.userId) {
      // Get push subscriptions for user
      try {
        const subscriptions = await this.getPushSubscriptions(order.userId);
        subscriptions.forEach(sub => {
          channels.push({ channel: 'push', subscription: sub });
        });
      } catch (err) {
        console.error('Error getting push subscriptions:', err);
      }
    }
    if (preferences[`${preferenceKey}InApp`]) {
      channels.push({ channel: 'in_app' });
    }

    // Create and send notifications
    for (const { channel, ...channelOptions } of channels) {
      try {
        // Create notification record
        const notification = await this.createNotification({
          userId: order.userId || undefined,
          orderId: order.id,
          type: notificationType,
          title,
          message,
          channel,
          metadata: {
            orderId: order.id,
            orderStatus: order.status,
            ...options,
          },
        });

        // Send notification (async, don't wait)
        this.sendNotification(notification.id, channel, channelOptions).catch(
          err => {
            console.error(`Error sending ${channel} notification:`, err);
          }
        );

        notifications.push(notification);
      } catch (error) {
        console.error(`Error creating ${channel} notification:`, error);
      }
    }

    return notifications;
  },

  /**
   * Get preference key for notification type
   */
  getPreferenceKey(notificationType) {
    const keyMap = {
      order_created: 'orderCreated',
      order_status_changed: 'orderStatusChanged',
      order_preparing: 'orderPreparing',
      order_ready: 'orderReady',
      order_served: 'orderServed',
      order_completed: 'orderCompleted',
      order_cancelled: 'orderCancelled',
    };
    return keyMap[notificationType] || 'orderStatusChanged';
  },

  /**
   * Generate notification content based on order and event type
   */
  generateOrderNotificationContent(order, notificationType, options = {}) {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const totalAmount = `₹${order.totalAmount?.toFixed(2) || '0.00'}`;

    const templates = {
      order_created: {
        title: 'Order Placed Successfully',
        message: `Your order #${orderNumber} has been placed successfully. Total: ${totalAmount}. We'll notify you when it's ready!`,
      },
      order_preparing: {
        title: 'Order Being Prepared',
        message: `Your order #${orderNumber} is now being prepared. We'll notify you when it's ready!`,
      },
      order_ready: {
        title: 'Order Ready!',
        message: `Your order #${orderNumber} is ready for pickup! Total: ${totalAmount}.`,
      },
      order_served: {
        title: 'Order Served',
        message: `Your order #${orderNumber} has been served. Enjoy your meal!`,
      },
      order_completed: {
        title: 'Order Completed',
        message: `Thank you! Your order #${orderNumber} has been completed. We hope you enjoyed your meal!`,
      },
      order_cancelled: {
        title: 'Order Cancelled',
        message: `Your order #${orderNumber} has been cancelled. If you have any questions, please contact us.`,
      },
      order_status_changed: {
        title: 'Order Status Updated',
        message: `Your order #${orderNumber} status has been updated to: ${order.status}.`,
      },
    };

    return templates[notificationType] || templates.order_status_changed;
  },

  /**
   * Get push subscriptions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of push subscriptions
   */
  async getPushSubscriptions(userId) {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching push subscriptions:', error);
      return [];
    }

    return (data || []).map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
      },
      deviceInfo: sub.device_info || {},
    }));
  },

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of notifications
   */
  async getNotifications(userId, filters = {}) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.channel) {
      query = query.eq('channel', filters.channel);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return (data || []).map(notif => ({
      id: notif.id,
      userId: notif.user_id || undefined,
      orderId: notif.order_id || undefined,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      channel: notif.channel,
      status: notif.status,
      metadata: notif.metadata || {},
      sentAt: notif.sent_at ? new Date(notif.sent_at) : undefined,
      deliveredAt: notif.delivered_at ? new Date(notif.delivered_at) : undefined,
      errorMessage: notif.error_message || undefined,
      createdAt: new Date(notif.created_at),
      updatedAt: new Date(notif.updated_at),
    }));
  },

  /**
   * Mark notification as read/delivered
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        status: 'read',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }

    return {
      id: data.id,
      status: data.status,
      deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
    };
  },
};

