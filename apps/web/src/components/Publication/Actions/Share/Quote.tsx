import type { MirrorablePublication } from '@good/lens';
import type { FC } from 'react';

import { Errors } from '@good/data';
import { TriStateValue } from '@good/lens';
import cn from '@good/ui/cn';
import { MenuItem } from '@headlessui/react';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { usePublicationStore } from 'src/store/non-persisted/publication/usePublicationStore';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface QuoteProps {
  publication: MirrorablePublication;
}

const Quote: FC<QuoteProps> = ({ publication }) => {
  const { currentProfile } = useProfileStore();
  const { setShowAuthModal, setShowNewPostModal } = useGlobalModalStateStore();
  const { setQuotedPublication } = usePublicationStore();
  const { isSuspended } = useProfileRestriction();
  const publicationType = publication.__typename;

  if (publication.operations.canQuote === TriStateValue.No) {
    return null;
  }

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { 'dropdown-active': focus },
          'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm'
        )
      }
      onClick={() => {
        if (!currentProfile) {
          setShowAuthModal(true);
          return;
        }

        if (isSuspended) {
          return toast.error(Errors.Suspended);
        }

        setQuotedPublication(publication);
        setShowNewPostModal(true);
      }}
    >
      <div className="flex items-center space-x-2">
        <ChatBubbleBottomCenterTextIcon className="size-4" />
        <div>
          {publicationType === 'Comment' ? 'Quote comment' : 'Quote post'}
        </div>
      </div>
    </MenuItem>
  );
};

export default Quote;
