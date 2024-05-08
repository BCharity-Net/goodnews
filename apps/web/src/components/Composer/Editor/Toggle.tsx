import type { FC, ReactNode } from 'react';

import { Tooltip } from '@good/ui';

interface ToggleProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: VoidFunction;
  pressed: boolean;
  tooltip?: string;
}

const Toggle: FC<ToggleProps> = ({
  children,
  disabled = false,
  onClick,
  pressed,
  tooltip
}) => {
  return (
    <Tooltip content={tooltip} placement="top">
      <button
        className="flex items-center justify-center rounded-lg bg-transparent p-2 hover:bg-gray-100 data-[state=on]:bg-gray-200 dark:hover:bg-gray-800 dark:data-[state=on]:bg-gray-700"
        data-state={pressed ? 'on' : 'off'}
        disabled={disabled}
        onClick={() => onClick?.()}
        onMouseDown={(event) => event.preventDefault()}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export default Toggle;
