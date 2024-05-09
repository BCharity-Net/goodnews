import type { FollowersRequest } from '@good/lens';
import type { FC } from 'react';

import { SETTINGS } from '@good/data/tracking';
import downloadJson from '@good/helpers/downloadJson';
import { LimitType, useFollowersLazyQuery } from '@good/lens';
import { Button, Card, CardHeader } from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import { useState } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

const Followers: FC = () => {
  const { currentProfile } = useProfileStore();
  const [followers, setFollowers] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  const request: FollowersRequest = {
    limit: LimitType.TwentyFive,
    of: currentProfile?.id
  };

  const [exportFollowers] = useFollowersLazyQuery({
    fetchPolicy: 'network-only'
  });

  const handleExportClick = async () => {
    Leafwatch.track(SETTINGS.EXPORT.FOLLOWERS);
    setExporting(true);
    const fetchFollowers = async (cursor?: string) => {
      const { data } = await exportFollowers({
        onCompleted: (data) => {
          setFollowers((prev) => {
            const newFollowers = data.followers.items.filter((newFollower) => {
              return !prev.some((follower) => follower.id === newFollower.id);
            });

            return [...prev, ...newFollowers];
          });
        },
        variables: { request: { ...request, cursor } }
      });

      if (
        data?.followers.items.length === 0 ||
        !data?.followers.pageInfo.next
      ) {
        setFetchCompleted(true);
        setExporting(false);
      } else {
        await fetchFollowers(data?.followers.pageInfo.next);
      }
    };

    await fetchFollowers();
  };

  const download = () => {
    downloadJson(followers, 'followers', () => {
      setFollowers([]);
      setFetchCompleted(false);
    });
  };

  return (
    <Card>
      <CardHeader
        body="Export all your followers to a JSON file."
        title="Export followers"
      />
      <div className="m-5">
        {followers.length > 0 ? (
          <div className="pb-2">
            Exported <b>{followers.length}</b> followers
          </div>
        ) : null}
        {fetchCompleted ? (
          <Button onClick={download} outline>
            Download followers
          </Button>
        ) : (
          <Button disabled={exporting} onClick={handleExportClick} outline>
            {exporting ? 'Exporting...' : 'Export now'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Followers;
