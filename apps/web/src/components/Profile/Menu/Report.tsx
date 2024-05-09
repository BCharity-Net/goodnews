import type { Profile } from '@good/lens';
import type { FC } from 'react';

import cn from '@good/ui/cn';
import { Menu } from '@headlessui/react';
import { FlagIcon } from '@heroicons/react/24/outline';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';

interface ReportProfileProps {
  profile: Profile;
}

const Report: FC<ReportProfileProps> = ({ profile }) => {
  const { setShowReportProfileModal } = useGlobalModalStateStore();

  return (
    <Menu.Item
      as="div"
      className={({ active }) =>
        cn(
          { 'dropdown-active': active },
          'm-2 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1.5 text-sm'
        )
      }
      onClick={() => setShowReportProfileModal(true, profile)}
    >
      <FlagIcon className="size-4" />
      <div>Report profile</div>
    </Menu.Item>
  );
};

export default Report;
