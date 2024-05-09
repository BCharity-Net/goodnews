import type { MarkupLinkProps } from '@good/types/misc';
import type { FC } from 'react';

import Slug from '@components/Shared/Slug';
import UserPreview from '@components/Shared/UserPreview';
import { PUBLICATION } from '@good/data/tracking';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { Leafwatch } from '@helpers/leafwatch';
import Link from 'next/link';

const Mention: FC<MarkupLinkProps> = ({ mentions, title }) => {
  const handle = title?.slice(1);

  if (!handle) {
    return null;
  }

  const fullHandles = mentions?.map(
    (mention) => mention.snapshotHandleMentioned.fullHandle
  );

  if (!fullHandles?.includes(handle)) {
    return title;
  }

  const canShowUserPreview = (handle: string) => {
    const foundMention = mentions?.find(
      (mention) => mention.snapshotHandleMentioned.fullHandle === handle
    );

    return foundMention?.snapshotHandleMentioned.linkedTo?.nftTokenId
      ? true
      : false;
  };

  const getLocalNameFromFullHandle = (handle: string) => {
    const foundMention = mentions?.find(
      (mention) => mention.snapshotHandleMentioned.fullHandle === handle
    );
    return foundMention?.snapshotHandleMentioned.localName;
  };

  return canShowUserPreview(handle) ? (
    <Link
      className="outline-none focus:underline"
      href={`/u/${getLocalNameFromFullHandle(handle)}`}
      onClick={(event) => {
        stopEventPropagation(event);
        Leafwatch.track(PUBLICATION.CLICK_MENTION, {
          handle: getLocalNameFromFullHandle(handle)
        });
      }}
    >
      <UserPreview handle={handle}>
        <Slug
          prefix="@"
          slug={getLocalNameFromFullHandle(handle)}
          useBrandColor
        />
      </UserPreview>
    </Link>
  ) : (
    <Slug prefix="@" slug={getLocalNameFromFullHandle(handle)} useBrandColor />
  );
};

export default Mention;
