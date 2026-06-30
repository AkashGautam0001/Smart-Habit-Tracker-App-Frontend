import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions';
import { useAuthStore } from '../store/authStore';

export const useSubscriptionStatus = () =>
  useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionsApi.getStatus().then((r) => r.data.data),
    staleTime: 60_000,
  });

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (billingCycle: 'monthly' | 'yearly') =>
      subscriptionsApi.createOrder(billingCycle).then((r) => r.data.data),
  });

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      billingCycle: string;
    }) => subscriptionsApi.verifyPayment(data).then((r) => r.data.data.user),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ['subscription-status'] });
    },
  });
};

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionsApi.cancel().then((r) => r.data.data.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-status'] });
    },
  });
};
