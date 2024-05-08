import type { FC } from 'react';

import IndexStatus from '@components/Shared/IndexStatus';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import {
  ExclamationTriangleIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { LensHub } from '@good/abis';
import { LENS_HUB } from '@good/data/constants';
import { Errors } from '@good/data/errors';
import { SETTINGS } from '@good/data/tracking';
import {
  Button,
  Card,
  CardHeader,
  Modal,
  Spinner,
  WarningMessage
} from '@good/ui';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useWriteContract } from 'wagmi';

const ProfileGuardianSettings: FC = () => {
  const { currentProfile } = useProfileStore();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleWrongNetwork = useHandleWrongNetwork();

  const onError = (error: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const { data, writeContractAsync } = useWriteContract({
    mutation: {
      onError: (error: Error) => onError(error),
      onSuccess: () => Leafwatch.track(SETTINGS.DANGER.UNPROTECT_PROFILE)
    }
  });

  const write = async () => {
    return await writeContractAsync({
      abi: LensHub,
      address: LENS_HUB,
      functionName: 'DANGER__disableTokenGuardian'
    });
  };

  const handleDisable = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);
      await handleWrongNetwork();
      return await write();
    } catch (error) {
      onError(error);
    }
  };

  if (!currentProfile?.guardian?.protected) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        body="This will disable the Profile Guardian and allow you to do some actions like transfer, burn and approve without restrictions."
        title={<div className="text-red-500">Disable profile guardian</div>}
      />
      <div className="m-5 space-y-5">
        <div className="text-lg font-bold">What else you should know</div>
        <div className="ld-text-gray-500 divide-y text-sm dark:divide-gray-700">
          <p className="pb-3">
            A 7-day Security Cooldown Period need to be elapsed for the Profile
            Guardian to become effectively disabled.
          </p>
          <p className="py-3">
            After the Profile Guardian is effectively disabled, you will be able
            to execute approvals and transfers without restrictions.
          </p>
        </div>
        {data ? (
          <div className="mt-5">
            <IndexStatus reload txHash={data} />
          </div>
        ) : (
          <Button
            disabled={isLoading}
            icon={
              isLoading ? (
                <Spinner size="xs" variant="danger" />
              ) : (
                <LockOpenIcon className="size-5" />
              )
            }
            onClick={() => setShowWarningModal(true)}
            variant="danger"
          >
            {isLoading ? 'Disabling...' : 'Disable now'}
          </Button>
        )}
      </div>
      <Modal
        icon={<ExclamationTriangleIcon className="size-5" />}
        onClose={() => setShowWarningModal(false)}
        show={showWarningModal}
        title="Danger zone"
      >
        <div className="space-y-3 p-5">
          <WarningMessage
            message={
              <div className="leading-6">
                Confirm that you have read all consequences and want to disable
                the Profile Guardian.
              </div>
            }
            title="Are you sure?"
          />
          <Button
            icon={<LockOpenIcon className="size-5" />}
            onClick={async () => {
              setShowWarningModal(false);
              await handleDisable();
            }}
            variant="danger"
          >
            Yes, disable
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default ProfileGuardianSettings;
