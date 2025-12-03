/**
 * Realtime Manager
 * Manages Supabase Realtime subscriptions with connection state, reconnection, and error handling
 */

import { supabase } from './supabase';
import { ordersService } from './database';

/**
 * Connection states
 */
export const ConnectionState = {
    CONNECTED: 'connected',
    CONNECTING: 'connecting',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error'
};

/**
 * Realtime Manager Class
 */
class RealtimeManager {
    constructor() {
        this.subscriptions = new Map();
        this.channels = new Map();
        this.connectionState = ConnectionState.DISCONNECTED;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.stateCallbacks = new Set();
        this.stats = {
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            reconnections: 0,
            errors: 0,
            messagesReceived: 0
        };
    }

    /**
     * Subscribe to a channel with enhanced features
     */
    subscribe(channelName, options = {}) {
        const {
            table,
            event = '*',
            filter,
            onData,
            onConnected,
            onDisconnected,
            onError,
            onReconnecting
        } = options;

        const subscriptionId = `${channelName}_${Date.now()}`;

        // Store subscription info
        const subscription = {
            id: subscriptionId,
            channelName,
            table,
            event,
            filter,
            callbacks: { onData, onConnected, onDisconnected, onError, onReconnecting },
            active: true,
            createdAt: Date.now()
        };

        this.subscriptions.set(subscriptionId, subscription);
        this.stats.totalSubscriptions++;
        this.stats.activeSubscriptions++;

        // Create or reuse channel
        this._setupChannel(subscription);

        // Return unsubscribe function
        return () => this.unsubscribe(subscriptionId);
    }

    /**
     * Setup channel with reconnection logic
     */
    _setupChannel(subscription) {
        const { channelName, table, event, filter, callbacks } = subscription;

        // Check if channel already exists
        let channel = this.channels.get(channelName);

        if (!channel) {
            // Create new channel
            channel = supabase.channel(channelName);

            // Setup postgres changes listener
            const changeConfig = {
                event,
                schema: 'public',
                table
            };

            if (filter) {
                changeConfig.filter = filter;
            }

            channel.on('postgres_changes', changeConfig, async (payload) => {
                this.stats.messagesReceived++;

                // Fetch fresh data and notify all subscribers
                try {
                    let data;
                    if (table === 'orders') {
                        data = await ordersService.getAll();
                    }
                    // Add more table handlers as needed

                    // Notify all subscribers of this channel
                    this.subscriptions.forEach(sub => {
                        if (sub.channelName === channelName && sub.callbacks.onData) {
                            sub.callbacks.onData(data, payload);
                        }
                    });
                } catch (error) {
                    console.error('Error fetching data for subscription:', error);
                    this._handleError(channelName, error);
                }
            });

            // Setup channel state listeners
            channel.on('system', {}, (payload) => {
                if (payload.status === 'ok') {
                    this._handleConnected(channelName);
                }
            });

            // Subscribe to channel
            channel.subscribe((status, error) => {
                if (status === 'SUBSCRIBED') {
                    this._handleConnected(channelName);
                } else if (status === 'CHANNEL_ERROR') {
                    this._handleError(channelName, error);
                } else if (status === 'TIMED_OUT') {
                    this._handleDisconnected(channelName);
                } else if (status === 'CLOSED') {
                    this._handleDisconnected(channelName);
                }
            });

            this.channels.set(channelName, channel);
        }

        // Call onConnected if already connected
        if (this.connectionState === ConnectionState.CONNECTED && callbacks.onConnected) {
            callbacks.onConnected();
        }
    }

    /**
     * Handle connection established
     */
    _handleConnected(channelName) {
        const previousState = this.connectionState;
        this.connectionState = ConnectionState.CONNECTED;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Notify subscribers
        this.subscriptions.forEach(sub => {
            if (sub.channelName === channelName && sub.callbacks.onConnected) {
                sub.callbacks.onConnected();
            }
        });

        // Notify state listeners
        if (previousState !== ConnectionState.CONNECTED) {
            this._notifyStateChange(ConnectionState.CONNECTED);
        }
    }

    /**
     * Handle disconnection
     */
    _handleDisconnected(channelName) {
        this.connectionState = ConnectionState.DISCONNECTED;

        // Notify subscribers
        this.subscriptions.forEach(sub => {
            if (sub.channelName === channelName && sub.callbacks.onDisconnected) {
                sub.callbacks.onDisconnected();
            }
        });

        this._notifyStateChange(ConnectionState.DISCONNECTED);

        // Attempt reconnection
        this._attemptReconnect(channelName);
    }

    /**
     * Handle errors
     */
    _handleError(channelName, error) {
        this.stats.errors++;
        this.connectionState = ConnectionState.ERROR;

        console.error(`Realtime error on channel ${channelName}:`, error);

        // Notify subscribers
        this.subscriptions.forEach(sub => {
            if (sub.channelName === channelName && sub.callbacks.onError) {
                sub.callbacks.onError(error);
            }
        });

        this._notifyStateChange(ConnectionState.ERROR, error);
    }

    /**
     * Attempt reconnection with exponential backoff
     */
    _attemptReconnect(channelName) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        this.stats.reconnections++;
        this.connectionState = ConnectionState.RECONNECTING;

        // Notify subscribers
        this.subscriptions.forEach(sub => {
            if (sub.channelName === channelName && sub.callbacks.onReconnecting) {
                sub.callbacks.onReconnecting(this.reconnectAttempts, this.reconnectDelay);
            }
        });

        this._notifyStateChange(ConnectionState.RECONNECTING, {
            attempt: this.reconnectAttempts,
            delay: this.reconnectDelay
        });

        // Exponential backoff
        setTimeout(() => {
            console.log(`Reconnecting to ${channelName} (attempt ${this.reconnectAttempts})...`);

            // Remove old channel
            const oldChannel = this.channels.get(channelName);
            if (oldChannel) {
                supabase.removeChannel(oldChannel);
                this.channels.delete(channelName);
            }

            // Recreate subscriptions for this channel
            this.subscriptions.forEach(sub => {
                if (sub.channelName === channelName && sub.active) {
                    this._setupChannel(sub);
                }
            });

            // Increase delay for next attempt (exponential backoff)
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        }, this.reconnectDelay);
    }

    /**
     * Unsubscribe from a subscription
     */
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) return;

        subscription.active = false;
        this.subscriptions.delete(subscriptionId);
        this.stats.activeSubscriptions--;

        // Check if any other subscriptions use this channel
        const channelStillInUse = Array.from(this.subscriptions.values()).some(
            sub => sub.channelName === subscription.channelName && sub.active
        );

        // Remove channel if no longer in use
        if (!channelStillInUse) {
            const channel = this.channels.get(subscription.channelName);
            if (channel) {
                supabase.removeChannel(channel);
                this.channels.delete(subscription.channelName);
            }
        }
    }

    /**
     * Subscribe to connection state changes
     */
    onStateChange(callback) {
        this.stateCallbacks.add(callback);

        // Immediately call with current state
        callback(this.connectionState);

        // Return unsubscribe function
        return () => {
            this.stateCallbacks.delete(callback);
        };
    }

    /**
     * Notify state change listeners
     */
    _notifyStateChange(state, data = null) {
        this.stateCallbacks.forEach(callback => {
            callback(state, data);
        });
    }

    /**
     * Get current connection state
     */
    getState() {
        return this.connectionState;
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            connectionState: this.connectionState,
            reconnectAttempts: this.reconnectAttempts,
            activeChannels: this.channels.size
        };
    }

    /**
     * Manually reconnect all subscriptions
     */
    reconnectAll() {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        this.channels.forEach((channel, channelName) => {
            supabase.removeChannel(channel);
            this.channels.delete(channelName);
        });

        this.subscriptions.forEach(sub => {
            if (sub.active) {
                this._setupChannel(sub);
            }
        });
    }

    /**
     * Disconnect all subscriptions
     */
    disconnectAll() {
        this.channels.forEach(channel => {
            supabase.removeChannel(channel);
        });

        this.channels.clear();
        this.connectionState = ConnectionState.DISCONNECTED;
        this._notifyStateChange(ConnectionState.DISCONNECTED);
    }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();

// Helper function for orders subscription
export function subscribeToOrdersEnhanced(options = {}) {
    return realtimeManager.subscribe('orders', {
        table: 'orders',
        ...options
    });
}

// Log stats every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        const stats = realtimeManager.getStats();
        console.log('\n=== Realtime Manager Stats ===');
        console.log(`Connection State: ${stats.connectionState}`);
        console.log(`Active Subscriptions: ${stats.activeSubscriptions}`);
        console.log(`Active Channels: ${stats.activeChannels}`);
        console.log(`Messages Received: ${stats.messagesReceived}`);
        console.log(`Reconnections: ${stats.reconnections}`);
        console.log(`Errors: ${stats.errors}`);
        console.log('============================\n');
    }, 5 * 60 * 1000);
}
