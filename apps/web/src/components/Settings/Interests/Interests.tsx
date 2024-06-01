import type { ProfileInterestsRequest, ProfileInterestTypes } from '@good/lens';
import type { FC } from 'react';

import Loader from '@components/Shared/Loader';
import { Errors } from '@good/data';
import { SETTINGS } from '@good/data/tracking';
import {
    useAddProfileInterestsMutation,
    useProfileInterestsOptionsQuery,
    useRemoveProfileInterestsMutation
} from '@good/lens';
import { useApolloClient } from '@good/lens/apollo';
import { Button } from '@good/ui';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import sanitizeProfileInterests from '@helpers/sanitizeProfileInterests';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useProfileStatus } from 'src/store/non-persisted/useProfileStatus';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

const MAX_TOPICS_ALLOWED = 12;

const Interests: FC = () => {
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileStatus();
  const { cache } = useApolloClient();

  const updateCache = (interests: string[]) => {
    cache.modify({
      fields: { interests: () => interests },
      id: `Profile:${currentProfile?.id}`
    });
  };

  const onError = (error: any) => {
    errorToast(error);
  };

  const { data, loading } = useProfileInterestsOptionsQuery({
    variables: { request: { forProfileId: currentProfile?.id } }
  });
  const [addProfileInterests] = useAddProfileInterestsMutation({
    onCompleted: () => Leafwatch.track(SETTINGS.INTERESTS.ADD),
    onError
  });
  const [removeProfileInterests] = useRemoveProfileInterestsMutation({
    onCompleted: () => Leafwatch.track(SETTINGS.INTERESTS.REMOVE),
    onError
  });

  const interestsData = data?.profileInterestsOptions as ProfileInterestTypes[];
  const selectedTopics = data?.profile?.interests || [];

  const onSelectTopic = (topic: ProfileInterestTypes) => {
    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      const request: ProfileInterestsRequest = { interests: [topic] };
      if (!selectedTopics.includes(topic)) {
        const interests = [...selectedTopics, topic];
        updateCache(interests);

        return addProfileInterests({ variables: { request } });
      }

      const topics = [...selectedTopics];
      topics.splice(topics.indexOf(topic), 1);
      updateCache(topics);

      return removeProfileInterests({ variables: { request } });
    } catch (error) {
      onError(error);
    }
  };

  if (loading) {
    return <Loader className="py-10" />;
  }

  return (
    <div className="m-5 space-y-4">
      {sanitizeProfileInterests(interestsData)?.map(
        ({ category, subCategories }) => (
          <div className="space-y-2" key={category.id}>
            <h2 className="text-sm font-medium capitalize">{category.label}</h2>
            <div className="flex flex-wrap items-center gap-3">
              {subCategories?.map((subCategory) => (
                <Button
                  className="font-medium capitalize"
                  disabled={
                    !selectedTopics.includes(subCategory.id) &&
                    selectedTopics.length === MAX_TOPICS_ALLOWED
                  }
                  icon={
                    selectedTopics.includes(subCategory.id) ? (
                      <CheckCircleIcon className="size-4" />
                    ) : (
                      <PlusCircleIcon className="size-4" />
                    )
                  }
                  key={subCategory.id}
                  onClick={() =>
                    onSelectTopic(subCategory.id as ProfileInterestTypes)
                  }
                  outline
                  size="sm"
                  variant={
                    selectedTopics.includes(subCategory.id)
                      ? 'primary'
                      : 'secondary'
                  }
                >
                  <div>{subCategory.label}</div>
                </Button>
              ))}
              {!subCategories.length ? (
                <Button
                  className="font-medium capitalize"
                  disabled={
                    !selectedTopics.includes(category.id) &&
                    selectedTopics.length === MAX_TOPICS_ALLOWED
                  }
                  icon={
                    selectedTopics.includes(category.id) ? (
                      <CheckCircleIcon className="size-4" />
                    ) : (
                      <PlusCircleIcon className="size-4" />
                    )
                  }
                  key={category.id}
                  onClick={() =>
                    onSelectTopic(category.id as ProfileInterestTypes)
                  }
                  outline
                  size="sm"
                  variant={
                    selectedTopics.includes(category.id)
                      ? 'primary'
                      : 'secondary'
                  }
                >
                  <div>{category.label}</div>
                </Button>
              ) : null}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Interests;
