import type { FC } from 'react';

import NotificationIcon from '@components/Notification/NotificationIcon';
import { STATIC_IMAGES_URL } from '@good/data/constants';
import cn from '@good/ui/cn';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
import Search from './Search';
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
  }

  const NavItem = ({ current, name, url }: NavItemProps) => {
    return (
      <Link
        className={cn(
          'cursor-pointer rounded-md px-2 py-1 text-left text-sm font-bold tracking-wide md:px-3',
          {
            'bg-gray-200 text-black dark:bg-gray-800 dark:text-white': current,
            'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white':
              !current
          }
        )}
        href={url}
      >
        {name}
      </Link>
    );
  };

  const NavItems = () => {
    const { pathname } = useRouter();

    return (
      <>
        <NavItem current={pathname === '/'} name="Home" url="/" />
        <NavItem
          current={pathname === '/explore'}
          name="Explore"
          url="/explore"
        />
        <MoreNavItems />
      </>
    );
  };

  return (
    <header className="divider sticky top-0 z-10 h-full bg-white dark:bg-black">
      {staffMode ? <StaffBar /> : null}
      <div className="container mx-auto max-w-screen-xl px-5">
        <div className="relative flex h-full flex-col items-start justify-between">
          <div className="flex flex-col items-start">
            <Link className="rounded-full outline-offset-8" href="/">
              <img
                alt="Logo"
                className="mb-4 size-8"
                height={32}
                src={`${STATIC_IMAGES_URL}/app-icon/${appIcon}.png`}
                width={32}
              />
            </Link>
            <button
              className="inline-flex items-center justify-center rounded-md text-gray-500 focus:outline-none md:hidden"
              onClick={() => setShowSearch(!showSearch)}
              type="button"
            >
              {showSearch ? (
                <XMarkIcon className="size-6" />
              ) : (
                <MagnifyingGlassIcon className="size-6" />
              )}
            </button>
            <div className="hidden md:block">
              <Search />
            </div>
            <nav className="mt-4 space-y-2">
              <NavItems />
            </nav>
          </div>
          <div className="mt-auto flex flex-col items-start gap-4">
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
      </div>
      {showSearch ? (
        <div className="m-3 md:hidden">
          <Search />
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
