import type { MirrorablePublication } from '@good/lens';
import type { FC } from 'react';

import { Errors } from '@good/data/errors';
import { PUBLICATION } from '@good/data/tracking';
import { useHidePublicationMutation } from '@good/lens';
import { useApolloClient } from '@good/lens/apollo';
import cn from '@good/ui/cn';
import { Menu } from '@headlessui/react';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface MirrorProps {
  isLoading: boolean;
  publication: MirrorablePublication;
  setIsLoading: (isLoading: boolean) => void;
}

const UndoMirror: FC<MirrorProps> = ({
  isLoading,
  publication,
  setIsLoading
}) => {
  const { currentProfile } = useProfileStore();
  const { cache } = useApolloClient();

  const updateCache = () => {
    cache.modify({
      fields: { mirrors: () => publication.stats.mirrors - 1 },
      id: cache.identify(publication.stats)
    });
    cache.evict({
      id: `${publication?.__typename}:${publication?.id}`
    });
  };

  const onError = (error?: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const [hidePost] = useHidePublicationMutation({
    onCompleted: () => {
      Leafwatch.track(PUBLICATION.UNDO_MIRROR);
      toast.success('Undone mirror successfully');
    },
    update: updateCache
  });

  const undoMirror = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);

      return await hidePost({
        variables: { request: { for: publication.id } }
      });
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Menu.Item
      as="div"
      className={({ active }) =>
        cn(
          { 'dropdown-active': active },
          'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm text-red-500'
        )
      }
      disabled={isLoading}
      onClick={undoMirror}
    >
      <div className="flex items-center space-x-2">
        <ArrowsRightLeftIcon className="size-4" />
        <div>Undo mirror</div>
      </div>
    </Menu.Item>
  );
};

export default UndoMirror;
