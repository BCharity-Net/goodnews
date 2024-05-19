import type {
    HideCommentRequest,
    MirrorablePublication,
    UnhideCommentRequest
} from '@good/lens';
import type { ApolloCache } from '@good/lens/apollo';
import type { FC } from 'react';

import { useHiddenCommentFeedStore } from '@components/Publication';
import { PUBLICATION } from '@good/data/tracking';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { useHideCommentMutation, useUnhideCommentMutation } from '@good/lens';
import cn from '@good/ui/cn';
import { MenuItem } from '@headlessui/react';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface HideCommentProps {
  publication: MirrorablePublication;
}

const HideComment: FC<HideCommentProps> = ({ publication }) => {
  const { currentProfile } = useProfileStore();
  const { showHiddenComments } = useHiddenCommentFeedStore();

  const request: HideCommentRequest | UnhideCommentRequest = {
    for: publication.id
  };

  const updateCache = (cache: ApolloCache<any>) => {
    cache.evict({ id: cache.identify(publication) });
  };

  const onError = (error: any) => {
    errorToast(error);
  };

  const [hideComment] = useHideCommentMutation({
    onCompleted: () => {
      toast.success('Comment hidden');
      Leafwatch.track(PUBLICATION.TOGGLE_HIDE_COMMENT, {
        hidden: true,
        publication_id: publication.id
      });
    },
    onError,
    update: updateCache,
    variables: { request }
  });

  const [unhideComment] = useUnhideCommentMutation({
    onCompleted: () => {
      toast.success('Comment unhidden');
      Leafwatch.track(PUBLICATION.TOGGLE_HIDE_COMMENT, {
        hidden: false,
        publication_id: publication.id
      });
    },
    onError,
    update: updateCache,
    variables: { request }
  });

  const canHideComment = currentProfile?.id !== publication?.by?.id;

  if (!canHideComment) {
    return null;
  }

  const toggleHideComment = async () => {
    if (showHiddenComments) {
      return await unhideComment();
    }

    return await hideComment();
  };

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { 'dropdown-active': focus },
          'm-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm'
        )
      }
      onClick={(event) => {
        stopEventPropagation(event);
        toggleHideComment();
      }}
    >
      <div className="flex items-center space-x-2">
        {showHiddenComments ? (
          <>
            <CheckCircleIcon className="size-4" />
            <div>Unhide comment</div>
          </>
        ) : (
          <>
            <NoSymbolIcon className="size-4" />
            <div>Hide comment</div>
          </>
        )}
      </div>
    </MenuItem>
  );
};

export default HideComment;
