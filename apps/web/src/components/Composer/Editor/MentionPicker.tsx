import type { EditorExtension } from '@helpers/prosekit/extension';
import type { FC } from 'react';
import type { MentionProfile } from 'src/hooks/prosekit/useMentionQuery';

import { EditorRegex } from '@good/data/regex';
import hasMisused from '@good/helpers/hasMisused';
import { Image } from '@good/ui';
import cn from '@good/ui/cn';
import isVerified from '@helpers/isVerified';
import {
  CheckBadgeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import { useEditor } from 'prosekit/react';
import {
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover
} from 'prosekit/react/autocomplete';
import { useState } from 'react';
import useMentionQuery from 'src/hooks/prosekit/useMentionQuery';

interface MentionItemProps {
  onSelect: VoidFunction;
  profile: MentionProfile;
}

const MentionItem: FC<MentionItemProps> = ({ onSelect, profile }) => {
  return (
    <div className="m-0 p-0">
      <AutocompleteItem
        className="focusable-dropdown-item m-1.5 flex cursor-pointer items-center space-x-2 rounded-lg px-3 py-1 dark:text-white"
        onSelect={onSelect}
      >
        <Image
          alt={profile.handle}
          className="size-7 rounded-full border bg-gray-200 dark:border-gray-700"
          height="28"
          src={profile.picture}
          width="28"
        />
        <div className="flex flex-col truncate">
          <div className="flex items-center space-x-1 text-sm">
            <span>{profile.name}</span>
            {isVerified(profile.id) ? (
              <CheckBadgeIcon className="text-brand-500 size-4" />
            ) : null}
            {hasMisused(profile.id) ? (
              <ExclamationCircleIcon className="size-4 text-red-500" />
            ) : null}
          </div>
          <span className="text-xs">{profile.displayHandle}</span>
        </div>
      </AutocompleteItem>
    </div>
  );
};

const MentionPicker: FC = () => {
  const editor = useEditor<EditorExtension>();
  const [queryString, setQueryString] = useState<string>('');
  const results = useMentionQuery(queryString);

  const handleProfileInsert = (profile: MentionProfile) => {
    editor.commands.insertMention({
      id: profile.id.toString(),
      kind: 'profile',
      value: profile.handle
    });
    editor.commands.insertText({ text: ' ' });
  };

  return (
    <AutocompletePopover
      className={cn(
        'z-10 block w-52 rounded-xl border bg-white p-0 shadow-sm dark:border-gray-700 dark:bg-gray-900',
        results.length === 0 && 'hidden'
      )}
      offset={10}
      onQueryChange={setQueryString}
      regex={EditorRegex.mention}
    >
      <AutocompleteList className="divide-y dark:divide-gray-700" filter={null}>
        {results.map((profile) => (
          <MentionItem
            key={profile.id}
            onSelect={() => handleProfileInsert(profile)}
            profile={profile}
          />
        ))}
      </AutocompleteList>
    </AutocompletePopover>
  );
};

export default MentionPicker;
