import type { ChangeEvent } from 'react';

import MenuTransition from '@components/Shared/MenuTransition';
import { Checkbox, Tooltip } from '@good/ui';
import cn from '@good/ui/cn';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { AdjustmentsVerticalIcon } from '@heroicons/react/24/outline';
import { useProfileFeedStore } from 'src/store/non-persisted/useProfileFeedStore';

const MediaFilter = () => {
  const { mediaFeedFilters, setMediaFeedFilters } = useProfileFeedStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMediaFeedFilters({
      ...mediaFeedFilters,
      [e.target.name]: e.target.checked
    });
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="rounded-md hover:bg-gray-300/20">
        <Tooltip content="Filter" placement="top">
          <AdjustmentsVerticalIcon className="size-5" />
        </Tooltip>
      </MenuButton>
      <MenuTransition>
        <MenuItems
          className="absolute right-0 z-[5] mt-1 rounded-xl border bg-white py-1 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
          static
        >
          <MenuItem
            as="label"
            className={({ focus }) =>
              cn(
                { 'dropdown-active': focus },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              checked={mediaFeedFilters.images}
              label="Images"
              name="images"
              onChange={handleChange}
            />
          </MenuItem>
          <MenuItem
            as="label"
            className={({ focus }) =>
              cn(
                { 'dropdown-active': focus },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              checked={mediaFeedFilters.video}
              label="Video"
              name="video"
              onChange={handleChange}
            />
          </MenuItem>
          <MenuItem
            as="label"
            className={({ focus }) =>
              cn(
                { 'dropdown-active': focus },
                'menu-item flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
          >
            <Checkbox
              checked={mediaFeedFilters.audio}
              label="Audio"
              name="audio"
              onChange={handleChange}
            />
          </MenuItem>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
};

export default MediaFilter;
