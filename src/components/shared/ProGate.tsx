import { ReactNode } from 'react';
import { PlanFeatures } from '../../config/plans.config';
import { usePlan } from '../../hooks/usePlan';
import UpgradePrompt from './UpgradePrompt';

interface Props {
  feature: keyof PlanFeatures;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProGate({ feature, children, fallback }: Props) {
  const { canDo } = usePlan();
  if (canDo(feature)) return <>{children}</>;
  return fallback ? <>{fallback}</> : <UpgradePrompt feature={feature} />;
}
