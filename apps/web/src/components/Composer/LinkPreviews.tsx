import type { FC } from 'react';

import Oembed from '@components/Shared/Oembed';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { KNOWN_ATTRIBUTES } from '@good/data/constants';
import getURLs from '@good/helpers/getURLs';
import { MetadataAttributeType } from '@lens-protocol/metadata';
import { useEffect, useState } from 'react';
import { usePublicationAttachmentStore } from 'src/store/non-persisted/publication/usePublicationAttachmentStore';
import { usePublicationAttributesStore } from 'src/store/non-persisted/publication/usePublicationAttributesStore';
import { usePublicationStore } from 'src/store/non-persisted/publication/usePublicationStore';

const LinkPreviews: FC = () => {
  const { publicationContent, quotedPublication } = usePublicationStore();
  const { attachments } = usePublicationAttachmentStore((state) => state);
  const { addAttribute, getAttribute, removeAttribute } =
    usePublicationAttributesStore();
  const [showRemove, setShowRemove] = useState(false);

  const urls = getURLs(publicationContent);

  useEffect(() => {
    if (urls.length) {
      removeAttribute(KNOWN_ATTRIBUTES.HIDE_OEMBED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.length]);

  if (
    !urls.length ||
    attachments.length ||
    quotedPublication ||
    getAttribute(KNOWN_ATTRIBUTES.HIDE_OEMBED)?.value === 'true'
  ) {
    return null;
  }

  return (
    <div className="relative m-5">
      <Oembed
        onLoad={(og) => setShowRemove(og?.title ? true : false)}
        url={urls[0]}
      />
      {showRemove && (
        <div className="absolute top-0 -m-3">
          <button
            className="rounded-full bg-gray-900 p-1.5 opacity-75"
            onClick={() =>
              addAttribute({
                key: KNOWN_ATTRIBUTES.HIDE_OEMBED,
                type: MetadataAttributeType.BOOLEAN,
                value: 'true'
              })
            }
            type="button"
          >
            <XMarkIcon className="size-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LinkPreviews;
