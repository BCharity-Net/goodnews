import type { FC } from 'react';

import { SparklesIcon } from '@heroicons/react/24/solid';
import { Badge } from '@good/ui';

const New: FC = () => {
  return (
    <Badge className="flex items-center space-x-1 border-blue-600 bg-blue-500">
      <SparklesIcon className="size-3" />
      <div>New</div>
    </Badge>
  );
};

export default New;
