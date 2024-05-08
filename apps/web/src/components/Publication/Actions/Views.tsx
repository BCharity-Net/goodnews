import type { FC } from 'react';

import { ChartBarIcon } from '@heroicons/react/24/outline';
import humanize from '@good/helpers/humanize';
import nFormatter from '@good/helpers/nFormatter';
import { Tooltip } from '@good/ui';
import { motion } from 'framer-motion';

interface ViewsProps {
  showCount: boolean;
  views: number;
}

const Views: FC<ViewsProps> = ({ showCount, views }) => {
  if (showCount) {
    return null;
  }

  return (
    <div className="ld-text-gray-500 flex items-center space-x-1">
      <motion.button
        aria-label="Views"
        className="rounded-full p-1.5 outline-offset-2 hover:bg-gray-300/20"
        disabled
        whileTap={{ scale: 0.9 }}
      >
        <Tooltip content={`${humanize(views)} Views`} placement="top" withDelay>
          <ChartBarIcon className="w-[15px] sm:w-[18px]" />
        </Tooltip>
      </motion.button>
      <span className="text-[11px] sm:text-xs">{nFormatter(views)}</span>
    </div>
  );
};

export default Views;
