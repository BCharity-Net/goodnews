import type { FC } from 'react';

import ToggleWithHelper from '@components/Shared/ToggleWithHelper';
import { OpenActionModuleType } from '@good/lens';
import { Input } from '@good/ui';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { useCollectModuleStore } from 'src/store/non-persisted/publication/useCollectModuleStore';

interface ReferralConfigProps {
  setCollectType: (data: any) => void;
}

const ReferralConfig: FC<ReferralConfigProps> = ({ setCollectType }) => {
  const { collectModule } = useCollectModuleStore((state) => state);

  return (
    <div className="mt-5">
      <ToggleWithHelper
        description="Share your fee with people who amplify your content"
        heading="Mirror referral reward"
        icon={<ArrowsRightLeftIcon className="size-5" />}
        on={Boolean(collectModule.referralFee)}
        setOn={() =>
          setCollectType({
            referralFee: collectModule.referralFee ? 0 : 25,
            type: collectModule.recipients?.length
              ? OpenActionModuleType.MultirecipientFeeCollectOpenActionModule
              : OpenActionModuleType.SimpleCollectOpenActionModule
          })
        }
      />
      {collectModule.referralFee ? (
        <div className="ml-8 mt-4 flex space-x-2 text-sm">
          <Input
            iconRight="%"
            label="Referral fee"
            max="100"
            min="1"
            onChange={(event) => {
              setCollectType({
                referralFee: parseInt(
                  event.target.value ? event.target.value : '0'
                )
              });
            }}
            placeholder="5"
            type="number"
            value={collectModule.referralFee}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ReferralConfig;
