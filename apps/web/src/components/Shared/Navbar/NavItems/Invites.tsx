import type { FC } from 'react';

import { Leafwatch } from '@helpers/leafwatch';
import { TicketIcon } from '@heroicons/react/24/outline';
import { INVITE } from '@good/data/tracking';
import cn from '@good/ui/cn';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';

interface InvitesProps {
  className?: string;
}

const Invites: FC<InvitesProps> = ({ className = '' }) => {
  const { setShowInvitesModal } = useGlobalModalStateStore();

  return (
    <button
      className={cn(
        'flex w-full items-center space-x-1.5 px-2 py-1.5 text-left text-sm text-gray-700 dark:text-gray-200',
        className
      )}
      onClick={() => {
        setShowInvitesModal(true);
        Leafwatch.track(INVITE.OPEN_INVITE);
      }}
      type="button"
    >
      <TicketIcon className="size-4" />
      <div>Invites</div>
    </button>
  );
};

export default Invites;
