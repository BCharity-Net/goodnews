import type { ElementType, FC, MouseEvent, ReactNode } from 'react';

import cn from '../cn';

interface BlockCardProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  forceRounded?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

export const BlockCard: FC<BlockCardProps> = ({
  as: Tag = 'div',
  children,
  className = '',
  forceRounded = false,
  onClick
}) => {
  return (
    <Tag
      className={cn(
        forceRounded
          ? 'rounded-xl'
          : 'border-x-0', // Removed 'rounded-none'
        'border bg-white dark:border-gray-700 dark:bg-black',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
};
