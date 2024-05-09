import type { MirrorablePublication } from '@good/lens';
import type { FC } from 'react';

import MetaDetails from '@components/Shared/Staff/MetaDetails';
import { isCommentPublication } from '@good/helpers/publicationHelpers';
import { Card } from '@good/ui';
import {
  HashtagIcon,
  RectangleStackIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

interface PublicationStaffToolProps {
  publication: MirrorablePublication;
}

const PublicationStaffTool: FC<PublicationStaffToolProps> = ({
  publication
}) => {
  const isComment = isCommentPublication(publication);

  return (
    <Card
      as="aside"
      className="mt-5 border-yellow-400 !bg-yellow-300/20 p-5"
      forceRounded
    >
      <div className="flex items-center space-x-2 text-yellow-600">
        <ShieldCheckIcon className="size-5" />
        <div className="text-lg font-bold">Staff tool</div>
      </div>
      <div className="mt-3 space-y-2">
        <MetaDetails
          icon={<HashtagIcon className="ld-text-gray-500 size-4" />}
          title="Publication ID"
          value={publication?.id}
        >
          {publication?.id}
        </MetaDetails>
        {isComment ? (
          <MetaDetails
            icon={<HashtagIcon className="ld-text-gray-500 size-4" />}
            title="Comment on"
            value={publication?.commentOn?.id}
          >
            {publication?.commentOn?.id}
          </MetaDetails>
        ) : null}
        {publication?.openActionModules?.length ? (
          <MetaDetails
            icon={<RectangleStackIcon className="ld-text-gray-500 size-4" />}
            noFlex
            title="Open action modules"
          >
            {(publication?.openActionModules || []).map((module) => (
              <div key={module.__typename}>{module.__typename}</div>
            ))}
          </MetaDetails>
        ) : null}
        {(publication?.metadata.tags || []).length > 0 ? (
          <MetaDetails
            icon={<TagIcon className="ld-text-gray-500 size-4" />}
            noFlex
            title="Tags"
          >
            {(publication?.metadata?.tags || []).map((tag) => (
              <div key={tag}>{tag}</div>
            ))}
          </MetaDetails>
        ) : null}
      </div>
    </Card>
  );
};

export default PublicationStaffTool;
