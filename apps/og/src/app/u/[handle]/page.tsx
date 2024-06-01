import type { AnyPublication, Profile } from '@good/lens';
import type { Metadata } from 'next';

import { APP_NAME, HANDLE_PREFIX } from '@good/data/constants';
import getAvatar from '@good/helpers/getAvatar';
import getProfile from '@good/helpers/getProfile';
import getPublicationData from '@good/helpers/getPublicationData';
import { isMirrorPublication } from '@good/helpers/publicationHelpers';
import {
    LimitType,
    ProfileDocument,
    PublicationType,
    PublicationsDocument
} from '@good/lens';
import { apolloClient } from '@good/lens/apollo';
import defaultMetadata from 'src/defaultMetadata';

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = params;
  const { data } = await apolloClient().query({
    query: ProfileDocument,
    variables: { request: { forHandle: `${HANDLE_PREFIX}${handle}` } }
  });

  if (!data.profile) {
    return defaultMetadata;
  }

  const profile = data.profile as Profile;
  const { displayName, link, slugWithPrefix } = getProfile(profile);
  const title = `${displayName} (${slugWithPrefix}) • ${APP_NAME}`;
  const description = (profile?.metadata?.bio || title).slice(0, 155);

  return {
    alternates: { canonical: `https://bcharity.net${link}` },
    applicationName: APP_NAME,
    creator: displayName,
    description: description,
    keywords: [
      'good',
      'bcharity.net',
      'social media profile',
      'social media',
      'goodcast',
      'polygon',
      'user profile',
      'lens',
      'lens protocol',
      'decentralized',
      'web3',
      displayName,
      slugWithPrefix
    ],
    metadataBase: new URL(`https://bcharity.net${link}`),
    openGraph: {
      description: description,
      images: [getAvatar(profile)],
      siteName: 'Good',
      type: 'profile',
      url: `https://bcharity.net${link}`
    },
    other: {
      'count:followers': profile.stats.followers,
      'count:following': profile.stats.following,
      'lens:handle': handle,
      'lens:id': profile.id
    },
    publisher: displayName,
    title: title,
    twitter: { card: 'summary', site: '@heydotxyz' }
  };
}

export default async function Page({ params }: Props) {
  const metadata = await generateMetadata({ params });
  const { data } = await apolloClient().query({
    query: PublicationsDocument,
    variables: {
      request: {
        limit: LimitType.Fifty,
        where: {
          from: metadata.other?.['lens:id'],
          publicationTypes: [
            PublicationType.Post,
            PublicationType.Quote,
            PublicationType.Mirror
          ]
        }
      }
    }
  });

  if (!metadata) {
    return <h1>{params.handle}</h1>;
  }

  const profileUrl = `https://bcharity.net/u/${metadata.other?.['lens:handle']}`;

  return (
    <>
      <h1>{metadata.title?.toString()}</h1>
      <h2>{metadata.description?.toString()}</h2>
      <div>
        <b>Stats</b>
        <ul>
          <li>
            <a href={`${profileUrl}/following`}>
              Following: {metadata.other?.['count:following']}
            </a>
          </li>
          <li>
            <a href={`${profileUrl}/followers`}>
              Followers: {metadata.other?.['count:followers']}
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3>Publications</h3>
        <ul>
          {data?.publications?.items?.map((publication: AnyPublication) => {
            const targetPublication = isMirrorPublication(publication)
              ? publication.mirrorOn
              : publication;
            const filteredContent =
              getPublicationData(targetPublication.metadata)?.content || '';

            return (
              <li key={publication.id}>
                <a href={`https://bcharity.net/posts/${publication.id}`}>
                  {filteredContent}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
