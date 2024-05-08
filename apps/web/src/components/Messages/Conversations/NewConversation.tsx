import type { Profile } from '@good/lens';
import type { FC } from 'react';

import SearchProfiles from '@components/Shared/SearchProfiles';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Modal } from '@good/ui';
import { useClient, useConversation } from '@xmtp/react-sdk';
import { useState } from 'react';
import { useMessagesStore } from 'src/store/non-persisted/useMessagesStore';

const NewConversation: FC = () => {
  const { setNewConversationAddress, setSelectedConversation } =
    useMessagesStore();
  const [value, setValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { client } = useClient();
  const { getCachedByPeerAddress } = useConversation();

  const onProfileSelected = async (profile: Profile) => {
    const conversation = await getCachedByPeerAddress(profile.ownedBy.address);
    setValue('');

    if (conversation) {
      setSelectedConversation(conversation);
      return setShowModal(false);
    }

    setNewConversationAddress(profile.ownedBy.address);
    return setShowModal(false);
  };

  return (
    <div className="m-5 flex items-center justify-between">
      <div className="text-lg font-bold">Messages</div>
      <button disabled={!client?.address} onClick={() => setShowModal(true)}>
        <PlusCircleIcon className="size-6" />
      </button>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="New Conversation"
      >
        <div className="p-5">
          <SearchProfiles
            onChange={(event) => setValue(event.target.value)}
            onProfileSelected={onProfileSelected}
            value={value}
          />
        </div>
      </Modal>
    </div>
  );
};

export default NewConversation;
