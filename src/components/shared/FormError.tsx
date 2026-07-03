import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  message: string;
  className?: string;
}

export default function FormError({ message, className }: FormErrorProps) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive',
        className,
      )}
    >
      {message}
    </motion.p>
  );
}
