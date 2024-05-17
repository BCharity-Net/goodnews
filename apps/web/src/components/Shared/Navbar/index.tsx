import type { FC } from 'react';

import NotificationIcon from '@components/Notification/NotificationIcon';
import { STATIC_IMAGES_URL } from '@good/data/constants';
import cn from '@good/ui/cn';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  DotsHorizontalIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { usePreferencesStore } from 'src/store/non-persisted/usePreferencesStore';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import MenuItems from './MenuItems';
import MessagesIcon from './MessagesIcon';
import ModIcon from './ModIcon';
import MoreNavItems from './MoreNavItems';
import StaffBar from './StaffBar';

const Navbar: FC = () => {
  const { currentProfile } = useProfileStore();
  const { staffMode } = useFeatureFlagsStore();
  const { appIcon } = usePreferencesStore();
  const [showSearch, setShowSearch] = useState(false);

  interface NavItemProps {
    current: boolean;
    name: string;
    url: string;
    icon: React.ReactNode;
  }

  const NavItem = ({ current, name, url, icon }: NavItemProps) => {
    return (
      <Link href={url}>
        <div
          className={cn(
            'flex cursor-pointer items-center rounded-full px-4 py-2 text-left text-lg font-bold tracking-wide transition-colors',
            {
              'bg-gray-200 text-black dark:bg-gray-800 dark:text-white':
                current,
              'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white':
                !current
            }
          )}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {name}
        </div>
      </Link>
    );
  };

  const NavItems = () => {
    const { pathname } = useRouter();

    return (
      <>
        <NavItem
          current={pathname === '/'}
          name=""
          url="/"
          icon={<HomeIcon className="h-12 w-12" />}
        />
        <NavItem
          current={pathname === '/explore'}
          name=""
          url="/explore"
          icon={<MagnifyingGlassIcon className="h-12 w-12" />}
        />
        <MoreNavItems />
      </>
    );
  };

  return (
    <header className="h-full bg-white dark:bg-black">
      {staffMode && <StaffBar />}
      <div className="fixed left-10 top-10 flex h-full w-64 flex-col">
        <div className="flex flex-col items-center space-y-4 p-4">
          <Link href="/">
            <div className="rounded-full outline-offset-8">
              <img
                alt="Logo"
                className="size-8"
                height={32}
                src={`${STATIC_IMAGES_URL}/app-icon/${appIcon}.png`}
                width={32}
              />
            </div>
          </Link>
          <nav className="mt-4 flex-grow space-y-2">
            <NavItems />
          </nav>
        </div>
        <div className="flex flex-col items-center space-y-4 p-4">
          {currentProfile ? (
            <>
              <ModIcon />
              <MessagesIcon />
              <NotificationIcon />
            </>
          ) : null}
          <MenuItems />
        </div>
      </div>
      {showSearch && (
        <div className="m-3 md:hidden">{/* Search 组件在 Sidebar 中 */}</div>
      )}
    </header>
  );
};

export default Navbar;