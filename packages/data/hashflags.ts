import { prideHashtags } from './pride-hashtags';

export const hashflags: Record<string, string> = {
  bhm: 'blm',
  bitcoin: 'bitcoin',
  blacklivesmatter: 'blm',
  blm: 'blm',
  bonsai: 'bonsai',
  btc: 'bitcoin',
  bts: 'bts',
  btsarmy: 'btsarmy',
  eth: 'ethereum',
  ethereum: 'ethereum',
  hashtag: 'hashtag',
  good: 'good',
  lens: 'lens',
  tape: 'tape',
  voted: 'voted',
  ...prideHashtags.reduce((acc, cur) => ({ ...acc, [cur]: 'pride' }), {})
};
