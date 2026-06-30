import { useAuthStore } from '../store/authStore';
import { PLANS, PlanFeatures, PlanLimits } from '../config/plans.config';

export const usePlan = () => {
  const user = useAuthStore((s) => s.user);
  const planId = (user?.plan ?? 'free') as 'free' | 'pro';
  const plan = PLANS[planId];
  const isPro = planId === 'pro';

  const canDo = (feature: keyof PlanFeatures): boolean => plan.features[feature];

  const withinLimit = (key: keyof PlanLimits, current: number): boolean => {
    const limit = plan.limits[key];
    return limit === Infinity || current < limit;
  };

  const getLimit = (key: keyof PlanLimits): number => plan.limits[key];

  return { plan, planId, isPro, canDo, withinLimit, getLimit };
};
