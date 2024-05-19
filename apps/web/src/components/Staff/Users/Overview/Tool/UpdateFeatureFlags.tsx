import type { Feature } from '@good/types/good';
import type { Dispatch, FC, SetStateAction } from 'react';

import Loader from '@components/Shared/Loader';
import { GOOD_API_URL } from '@good/data/constants';
import { STAFFTOOLS } from '@good/data/tracking';
import getAllFeatureFlags from '@good/helpers/api/getAllFeatureFlags';
import { Toggle } from '@good/ui';
import getAuthApiHeaders from '@helpers/getAuthApiHeaders';
import { Leafwatch } from '@helpers/leafwatch';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

import ToggleWrapper from './ToggleWrapper';

interface UpdateFeatureFlagsProps {
  flags: string[];
  profileId: string;
  setFlags: Dispatch<SetStateAction<string[]>>;
}

const UpdateFeatureFlags: FC<UpdateFeatureFlagsProps> = ({
  flags,
  profileId,
  setFlags
}) => {
  const [updating, setUpdating] = useState(false);

  const { data: allFeatureFlags, isLoading } = useQuery({
    queryFn: () => getAllFeatureFlags(getAuthApiHeaders()),
    queryKey: ['getAllFeatureFlags']
  });

  if (isLoading) {
    return <Loader className="my-5" message="Loading feature flags" />;
  }

  const availableFeatures = allFeatureFlags || [];
  const enabledFlags = flags;

  const updateFeatureFlag = (feature: Feature) => {
    const { id, key } = feature;
    const enabled = !enabledFlags.includes(key);

    setUpdating(true);
    toast.promise(
      axios.post(
        `${GOOD_API_URL}/internal/features/assign`,
        { enabled, id, profile_id: profileId },
        { headers: getAuthApiHeaders() }
      ),
      {
        error: () => {
          setUpdating(false);
          return 'Failed to update feature flag';
        },
        loading: 'Updating feature flag...',
        success: () => {
          Leafwatch.track(STAFFTOOLS.USERS.ASSIGN_FEATURE_FLAG, {
            feature: key,
            profile_id: profileId
          });
          setUpdating(false);
          setFlags(
            enabled
              ? [...enabledFlags, key]
              : enabledFlags.filter((f) => f !== key)
          );
          return 'Feature flag updated';
        }
      }
    );
  };

  return (
    <div className="space-y-2 font-bold">
      {availableFeatures.map((feature) => (
        <ToggleWrapper key={feature.id} title={feature.key}>
          <Toggle
            disabled={updating}
            on={enabledFlags.includes(feature.key)}
            setOn={() => updateFeatureFlag(feature)}
          />
        </ToggleWrapper>
      ))}
    </div>
  );
};

export default UpdateFeatureFlags;
