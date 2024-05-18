import type { FC } from 'react';
import { PROFILE } from '@good/data/tracking';
import { TabButton } from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import {
  ChartBarIcon,
  ChatBubbleLeftIcon,
  FilmIcon,
  PencilSquareIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { ProfileFeedType } from 'src/enums';
import { useProStore } from 'src/store/non-persisted/useProStore';
import MediaFilter from './Filters/MediaFilter';

interface FeedTypeProps {
  feedType: string;
  setFeedType?: (type: ProfileFeedType) => void;
}

const FeedType: FC<FeedTypeProps> = ({ feedType, setFeedType }) => {
  const { isPro } = useProStore();

  const switchTab = (type: string) => {
    if (setFeedType) {
      setFeedType(type as ProfileFeedType);
    }
    Leafwatch.track(PROFILE.SWITCH_PROFILE_FEED_TAB, {
      profile_feed_type: type.toLowerCase()
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3 px-5 pb-2 sm:mt-0 sm:px-0 md:pb-0"> 
        <TabButton
          active={feedType === ProfileFeedType.Feed}
          icon={<PencilSquareIcon className="size-8" />}
          name="Feed"
          onClick={() => switchTab(ProfileFeedType.Feed)}
          type={ProfileFeedType.Feed.toLowerCase()}
        />
        <TabButton
          active={feedType === ProfileFeedType.Replies}
          icon={<ChatBubbleLeftIcon className="size-8" />}
          name="Replies"
          onClick={() => switchTab(ProfileFeedType.Replies)}
          type={ProfileFeedType.Replies.toLowerCase()}
        />
        <TabButton
          active={feedType === ProfileFeedType.Media}
          icon={<FilmIcon className="size-8" />}
          name="Media"
          onClick={() => switchTab(ProfileFeedType.Media)}
          type={ProfileFeedType.Media.toLowerCase()}
        />
        <TabButton
          active={feedType === ProfileFeedType.Collects}
          icon={<RectangleStackIcon className="size-8" />}
          name="Collected"
          onClick={() => switchTab(ProfileFeedType.Collects)}
          type={ProfileFeedType.Collects.toLowerCase()}
        />
        {isPro && (
          <TabButton
            active={feedType === ProfileFeedType.Stats}
            icon={<ChartBarIcon className="size-8" />}
            name="Stats"
            onClick={() => switchTab(ProfileFeedType.Stats)}
            type={ProfileFeedType.Stats.toLowerCase()}
          />
        )}
      </div>
      <div className="flex items-center gap-3 px-5">
        {feedType === ProfileFeedType.Media && (
          <>
            <span>Media Filter:</span>
            <MediaFilter />
          </>
        )}
      </div>
    </div>
  );
};

export default FeedType;
