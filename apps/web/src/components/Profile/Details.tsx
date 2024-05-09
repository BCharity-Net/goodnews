import type { Profile } from '@good/lens';
import type { FC, ReactNode } from 'react';

import Markup from '@components/Shared/Markup';
import FollowUnfollowButton from '@components/Shared/Profile/FollowUnfollowButton';
import Slug from '@components/Shared/Slug';
import { EXPANDED_AVATAR, STATIC_IMAGES_URL } from '@good/data/constants';
import formatDate from '@good/helpers/datetime/formatDate';
import getAvatar from '@good/helpers/getAvatar';
import getFavicon from '@good/helpers/getFavicon';
import getLennyURL from '@good/helpers/getLennyURL';
import getMentions from '@good/helpers/getMentions';
import getMisuseDetails from '@good/helpers/getMisuseDetails';
import getProfile from '@good/helpers/getProfile';
import getProfileAttribute from '@good/helpers/getProfileAttribute';
import hasMisused from '@good/helpers/hasMisused';
import { FollowModuleType } from '@good/lens';
import { Button, Image, LightBox, Tooltip } from '@good/ui';
import isVerified from '@helpers/isVerified';
import {
  ClockIcon,
  Cog6ToothIcon,
  HashtagIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  EyeSlashIcon
} from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import urlcat from 'urlcat';

import Badges from './Badges';
import Pro from './Badges/Pro';
import Followerings from './Followerings';
import InternalTools from './InternalTools';
import InvitedBy from './InvitedBy';
import ProfileMenu from './Menu';
import MutualFollowers from './MutualFollowers';
import ScamWarning from './ScamWarning';
import Score from './Score';

export const MetaDetails = ({
  children,
  icon
}: {
  children: ReactNode;
  icon: ReactNode;
}) => (
  <div className="flex items-center gap-2">
    {icon}
    <div className="text-md truncate">{children}</div>
  </div>
);

interface DetailsProps {
  isSuspended: boolean;
  profile: Profile;
}

const Details: FC<DetailsProps> = ({ isSuspended = false, profile }) => {
  const { push } = useRouter();
  const { currentProfile } = useProfileStore();
  const { staffMode } = useFeatureFlagsStore();
  const [expandedImage, setExpandedImage] = useState<null | string>(null);
  const { resolvedTheme } = useTheme();

  const followType = profile?.followModule?.type;
  const misuseDetails = getMisuseDetails(profile.id);

  return (
    <div className="mb-4 space-y-5 px-5 sm:px-0">
      <div className="relative -mt-24 size-32 sm:-mt-32 sm:size-52">
        <Image
          alt={profile.id}
          className="size-32 cursor-pointer rounded-xl bg-gray-200 ring-8 ring-gray-50 sm:size-52 dark:bg-gray-700 dark:ring-black"
          height={128}
          onClick={() => setExpandedImage(getAvatar(profile, EXPANDED_AVATAR))}
          onError={({ currentTarget }) => {
            currentTarget.src = getLennyURL(profile.id);
          }}
          src={getAvatar(profile)}
          width={128}
        />
        <LightBox
          onClose={() => setExpandedImage(null)}
          show={Boolean(expandedImage)}
          url={expandedImage}
        />
      </div>
      <div className="space-y-1 py-2">
        <div className="flex items-center gap-1.5 text-2xl font-bold">
          <div className="truncate">{getProfile(profile).displayName}</div>
          {isVerified(profile.id) ? (
            <Tooltip content="Verified">
              <CheckBadgeIcon className="text-brand-500 size-6" />
            </Tooltip>
          ) : null}
          {hasMisused(profile.id) ? (
            <Tooltip content={misuseDetails?.type}>
              <ExclamationCircleIcon className="text-brand-500 size-6" />
            </Tooltip>
          ) : null}
          {isSuspended ? (
            <Tooltip content="Suspended">
              <EyeSlashIcon className="text-brand-500 size-6" />
            </Tooltip>
          ) : null}
          <Pro id={profile.id} />
        </div>
        <div className="flex items-center space-x-3">
          <Slug
            className="text-sm sm:text-base"
            slug={getProfile(profile).slugWithPrefix}
          />
          {profile.operations.isFollowingMe.value ? (
            <div className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
              Follows you
            </div>
          ) : null}
        </div>
      </div>
      {profile?.metadata?.bio ? (
        <div className="markup linkify text-md mr-0 break-words sm:mr-10">
          <Markup mentions={getMentions(profile?.metadata.bio)}>
            {profile?.metadata.bio}
          </Markup>
        </div>
      ) : null}
      <div className="space-y-5">
        <ScamWarning profileId={profile.id} />
        <Followerings profile={profile} />
        <div className="flex items-center space-x-2">
          {currentProfile?.id === profile.id ? (
            <Button
              icon={<Cog6ToothIcon className="size-5" />}
              onClick={() => push('/settings')}
              outline
              variant="secondary"
            >
              Edit Profile
            </Button>
          ) : followType !== FollowModuleType.RevertFollowModule ? (
            <FollowUnfollowButton profile={profile} />
          ) : null}
          <ProfileMenu profile={profile} />
        </div>
        {currentProfile?.id !== profile.id ? (
          <MutualFollowers
            handle={getProfile(profile).slug}
            profileId={profile.id}
          />
        ) : null}
        <div className="divider w-full" />
        <div className="space-y-2">
          {staffMode ? (
            <MetaDetails
              icon={<ShieldCheckIcon className="size-4 text-yellow-600" />}
            >
              <Link
                className="text-yellow-600"
                href={getProfile(profile).staffLink}
              >
                Open in Staff Tools
              </Link>
            </MetaDetails>
          ) : null}
          <MetaDetails icon={<HashtagIcon className="size-4" />}>
            {parseInt(profile.id)}
          </MetaDetails>
          <Score id={profile.id} />
          {getProfileAttribute('location', profile?.metadata?.attributes) ? (
            <MetaDetails icon={<MapPinIcon className="size-4" />}>
              {getProfileAttribute('location', profile?.metadata?.attributes)}
            </MetaDetails>
          ) : null}
          {profile?.onchainIdentity?.ens?.name ? (
            <MetaDetails
              icon={
                <img
                  alt="ENS Logo"
                  className="size-4"
                  height={16}
                  src={`${STATIC_IMAGES_URL}/brands/ens.svg`}
                  width={16}
                />
              }
            >
              {profile?.onchainIdentity?.ens?.name}
            </MetaDetails>
          ) : null}
          {getProfileAttribute('website', profile?.metadata?.attributes) ? (
            <MetaDetails
              icon={
                <img
                  alt="Website"
                  className="size-4 rounded-full"
                  height={16}
                  src={getFavicon(
                    getProfileAttribute(
                      'website',
                      profile?.metadata?.attributes
                    )
                  )}
                  width={16}
                />
              }
            >
              <Link
                href={`https://${getProfileAttribute(
                  'website',
                  profile?.metadata?.attributes
                )
                  ?.replace('https://', '')
                  .replace('http://', '')}`}
                rel="noreferrer noopener me"
                target="_blank"
              >
                {getProfileAttribute('website', profile?.metadata?.attributes)
                  ?.replace('https://', '')
                  .replace('http://', '')}
              </Link>
            </MetaDetails>
          ) : null}
          {getProfileAttribute('x', profile?.metadata?.attributes) ? (
            <MetaDetails
              icon={
                <img
                  alt="X Logo"
                  className="size-4"
                  height={16}
                  src={`${STATIC_IMAGES_URL}/brands/${
                    resolvedTheme === 'dark' ? 'x-dark.png' : 'x-light.png'
                  }`}
                  width={16}
                />
              }
            >
              <Link
                href={urlcat('https://x.com/:username', {
                  username: getProfileAttribute(
                    'x',
                    profile?.metadata?.attributes
                  )?.replace('https://x.com/', '')
                })}
                rel="noreferrer noopener"
                target="_blank"
              >
                {getProfileAttribute(
                  'x',
                  profile?.metadata?.attributes
                )?.replace('https://x.com/', '')}
              </Link>
            </MetaDetails>
          ) : null}
          <MetaDetails icon={<ClockIcon className="size-4" />}>
            Joined {formatDate(profile.createdAt)}
          </MetaDetails>
        </div>
      </div>
      {profile.invitedBy ? (
        <>
          <div className="divider w-full" />
          <InvitedBy profile={profile.invitedBy} />
        </>
      ) : null}
      <Badges
        address={profile.ownedBy.address}
        id={profile.id}
        onchainIdentity={profile.onchainIdentity}
      />
      <InternalTools profile={profile} />
    </div>
  );
};

export default Details;
