import type { Profile, ProfileSearchRequest } from '@good/lens';
import type { ChangeEvent, FC } from 'react';

import {
    CustomFiltersType,
    LimitType,
    useSearchProfilesLazyQuery
} from '@good/lens';
import { Card, Input } from '@good/ui';

import Loader from './Loader';
import SmallUserProfile from './SmallUserProfile';

interface SearchProfilesProps {
  error?: boolean;
  hideDropdown?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onProfileSelected: (profile: Profile) => void;
  placeholder?: string;
  skipGardeners?: boolean;
  value: string;
}

const SearchProfiles: FC<SearchProfilesProps> = ({
  error = false,
  hideDropdown = false,
  onChange,
  onProfileSelected,
  placeholder = 'Search…',
  skipGardeners = false,
  value
}) => {
  const [searchUsers, { data, loading }] = useSearchProfilesLazyQuery();

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);

    const keyword = event.target.value;
    const request: ProfileSearchRequest = {
      limit: LimitType.Ten,
      query: keyword,
      ...(!skipGardeners && {
        where: { customFilters: [CustomFiltersType.Gardeners] }
      })
    };

    searchUsers({ variables: { request } });
  };

  const profiles = data?.searchProfiles.items as Profile[];

  return (
    <div className="w-full">
      <Input
        error={error}
        onChange={handleSearch}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {!hideDropdown && value.length > 0 ? (
        <div className="absolute mt-2 flex w-[94%] max-w-md flex-col">
          <Card className="z-[2] max-h-[80vh] overflow-y-auto py-2">
            {loading ? (
              <Loader className="my-3" message="Searching users" small />
            ) : (
              <>
                {profiles.slice(0, 7).map((profile) => (
                  <div
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={profile.id}
                    onClick={() => {
                      if (onProfileSelected) {
                        onProfileSelected(profile);
                      }
                    }}
                  >
                    <SmallUserProfile profile={profile} />
                  </div>
                ))}
                {profiles.length === 0 ? (
                  <div className="px-4 py-2">No matching users</div>
                ) : null}
              </>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default SearchProfiles;
