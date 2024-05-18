import type { FC, ReactNode } from 'react';

import { BlockCard } from './BlockCard';

interface EmptyStateProps {
  hideCard?: boolean;
  icon: ReactNode;
  message: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  hideCard = false,
  icon,
  message
}) => {
  return (
    <BlockCard
      className={hideCard ? 'border-0 !bg-transparent !shadow-none' : 'rounded-none'} 
    >
      <div className="grid justify-items-center space-y-2 p-5">
        <div>{icon}</div>
        <div>{message}</div>
      </div>
    </BlockCard>
  );
};
