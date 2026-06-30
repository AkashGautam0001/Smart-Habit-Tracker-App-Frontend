import apiClient from './client';
import type { ApiResponse, User } from '../types';

export interface SubscriptionStatus {
  plan: 'free' | 'pro';
  planExpiresAt: string | null;
  subscription: {
    _id: string;
    billingCycle: 'monthly' | 'yearly';
    status: 'active' | 'cancelled' | 'expired';
    amount: number;
    startDate: string;
    endDate: string;
  } | null;
}

export interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  billingCycle: 'monthly' | 'yearly';
}

export const subscriptionsApi = {
  createOrder: (billingCycle: 'monthly' | 'yearly') =>
    apiClient.post<ApiResponse<OrderData>>('/subscriptions/create-order', { billingCycle }),

  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    billingCycle: string;
  }) =>
    apiClient.post<ApiResponse<{ user: User }>>('/subscriptions/verify-payment', data),

  getStatus: () =>
    apiClient.get<ApiResponse<SubscriptionStatus>>('/subscriptions/status'),

  cancel: () =>
    apiClient.post<ApiResponse<{ message: string }>>('/subscriptions/cancel'),
};
