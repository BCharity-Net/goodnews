import type { MirrorablePublication } from '@good/lens';
import type { FC } from 'react';

import { PUBLICATION } from '@good/data/tracking';
import getPublicationData from '@good/helpers/getPublicationData';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import cn from '@good/ui/cn';
import { MenuItem } from '@headlessui/react';
import { Leafwatch } from '@helpers/leafwatch';
import { LanguageIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import urlcat from 'urlcat';

interface TranslateProps {
  publication: MirrorablePublication;
}

const Translate: FC<TranslateProps> = ({ publication }) => {
  const filteredContent =
    getPublicationData(publication.metadata)?.content || '';

  if (filteredContent.length < 1) {
    return null;
  }

  const getGoogleTranslateUrl = (text: string): string => {
    return encodeURI(
      urlcat('https://translate.google.com/#auto|en|:text', { text })
    );
  };

  return (
    <MenuItem
      as={Link}
      className={({ focus }) =>
        cn(
          { 'dropdown-active': focus },
          'm-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm'
        )
      }
      href={getGoogleTranslateUrl(filteredContent || '')}
      onClick={(event) => {
        stopEventPropagation(event);
        Leafwatch.track(PUBLICATION.TRANSLATE, {
          publication_id: publication.id
        });
      }}
      target="_blank"
    >
      <div className="flex items-center space-x-2">
        <LanguageIcon className="size-4" />
        <div>Translate</div>
      </div>
    </MenuItem>
  );
};

export default Translate;
