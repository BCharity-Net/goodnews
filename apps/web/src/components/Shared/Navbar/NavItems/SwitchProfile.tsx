import type { FC } from 'react';

import cn from '@good/ui/cn';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';

interface SwitchProfileProps {
  className?: string;
}

const SwitchProfile: FC<SwitchProfileProps> = ({ className = '' }) => {
  const { setShowProfileSwitchModal } = useGlobalModalStateStore();

  return (
    <button
      className={cn(
        'flex w-full items-center space-x-2 px-2 py-1.5 text-left text-sm text-gray-700 focus:outline-none dark:text-gray-200',
        className
      )}
      onClick={() => setShowProfileSwitchModal(true)}
      type="button"
    >
      <ArrowsRightLeftIcon className="size-4" />
      <span>Switch profile</span>
    </button>
  );
};

export default SwitchProfile;
