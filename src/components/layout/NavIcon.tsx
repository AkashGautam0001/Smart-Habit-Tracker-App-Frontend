import type { ElementType } from 'react';
import * as Icons from '@phosphor-icons/react';

interface NavIconProps {
  name: string;
  size?: number;
  weight?: 'bold' | 'duotone' | 'fill' | 'regular';
  className?: string;
  color?: string;
}

export default function NavIcon({
  name,
  size = 20,
  weight = 'duotone',
  className,
  color,
}: NavIconProps) {
  const Icon = (Icons as unknown as Record<string, ElementType>)[name];
  if (!Icon) return null;
  return <Icon size={size} weight={weight} className={className} color={color} />;
}
