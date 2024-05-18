import type { FC, ReactNode } from 'react';
import { useRouter } from 'next/router';
import cn from '../cn';

interface TabButtonProps {
  active: boolean;
  className?: string;
  icon?: ReactNode;
  name: string;
  onClick: () => void;
  showOnSm?: boolean;
  type?: string;
}

const TabButton: FC<TabButtonProps> = ({
  active,
  className = '',
  icon,
  name,
  onClick,
  showOnSm = false,
  type
}) => {
  const router = useRouter();

  return (
    <button
      aria-label={name}
      className={cn(
        'relative',
        { 'text-black dark:text-white': active },
        { 'bg-gray-300 dark:bg-gray-300/20': active },
        'hover:bg-gray-300 dark:hover:bg-gray-300/30',
        'hover:text-black hover:dark:text-white',
        'flex items-center justify-center space-x-2 rounded-lg px-4 py-2 text-sm sm:px-3 sm:py-1.5',
        className
      )}
      onClick={() => {
        if (type) {
          router.replace({ query: { ...router.query, type } }, undefined, {
            shallow: true
          });
        }
        onClick();
      }}
      type="button"
    >
      {icon}
      <span className={cn({ 'hidden sm:block': !showOnSm })}>{name}</span>
      {active && (
        <span className="absolute bottom-0 right-0 w-full h-1 bg-pink-500 rounded-t-lg"></span>
      )}
    </button>
  );
};

export default TabButton;
