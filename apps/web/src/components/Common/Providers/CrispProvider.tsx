import type { FC } from 'react';

import { CRISP_WEBSITE_ID } from '@good/data/constants';
import getAvatar from '@good/helpers/getAvatar';
import getProfile from '@good/helpers/getProfile';
import { Crisp } from 'crisp-sdk-web';
import { useEffect } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

const CrispProvider: FC = () => {
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    if (location.hostname !== 'bcharity.net') {
      return;
    }

    // Configure Crisp
    Crisp.configure(CRISP_WEBSITE_ID, { autoload: true });
    Crisp.chat.hide();

    Crisp.chat.onChatClosed(() => {
      Crisp.chat.hide();
    });

    Crisp.message.onMessageReceived(() => {
      Crisp.chat.show();
    });

    // Set user details
    if (currentProfile) {
      Crisp.user.setNickname(getProfile(currentProfile).displayName);
      Crisp.user.setAvatar(getAvatar(currentProfile));
      Crisp.session.setData({ handle: getProfile(currentProfile).slug });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]);

  return null;
};

export default CrispProvider;
