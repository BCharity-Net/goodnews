import type { FC } from 'react';

import { STATIC_IMAGES_URL } from '@good/data/constants';
import humanize from '@good/helpers/humanize';
import cn from '@good/ui/cn';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { useScoreStore } from 'src/store/non-persisted/useScoreStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface ScoreProps {
  className?: string;
  onClick?: () => void;
}

const Score: FC<ScoreProps> = ({ className = '', onClick }) => {
  const { currentProfile } = useProfileStore();
  const { score } = useScoreStore();
  const { setShowScoreModal } = useGlobalModalStateStore();

  return (
    <button
      className={cn(
        'flex w-full items-center space-x-1.5 p-2 text-left font-mono text-xs text-gray-700 dark:text-gray-200',
        className
      )}
      onClick={() => {
        setShowScoreModal(true, score, currentProfile?.id);
        onClick?.();
      }}
      type="button"
    >
      <img
        className="mr-0.5 size-3.5"
        src={`${STATIC_IMAGES_URL}/app-icon/2.png`}
      />
      <div>{humanize(score)}</div>
    </button>
  );
};

export default Score;
