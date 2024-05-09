import type { FC } from 'react';

import cn from '@good/ui/cn';
import { Menu } from '@headlessui/react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import MenuTransition from '../MenuTransition';
import Bookmarks from './NavItems/Bookmarks';
import Support from './NavItems/Support';
const MoreNavItems: FC = () => {
  const { currentProfile } = useProfileStore();

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            className={cn(
              'w-full cursor-pointer rounded-md px-2 py-1 text-left text-sm font-bold tracking-wide md:px-3',
              {
                'bg-gray-200 text-black dark:bg-gray-800 dark:text-white': open,
                'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white':
                  !open
              }
            )}
          >
            More
          </Menu.Button>
          <MenuTransition>
            <Menu.Items
              className="absolute mt-2 rounded-xl border bg-white shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
              static
            >
              {currentProfile ? (
                <>
                  <Menu.Item
                    as="div"
                    className={({ active }: { active: boolean }) =>
                      cn({ 'dropdown-active': active }, 'm-2 rounded-lg')
                    }
                  >
                    <Bookmarks />
                  </Menu.Item>
                  <div className="divider" />
                </>
              ) : null}
              <Menu.Item
                as="div"
                className={({ active }: { active: boolean }) =>
                  cn({ 'dropdown-active': active }, 'm-2 rounded-lg')
                }
              >
                <Support />
              </Menu.Item>
            </Menu.Items>
          </MenuTransition>
        </>
      )}
    </Menu>
  );
};

export default MoreNavItems;
