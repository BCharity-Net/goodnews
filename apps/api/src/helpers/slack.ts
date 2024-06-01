import { BRAND_COLOR } from '@good/data/constants';
import axios from 'axios';

const SLACK_CHANNELS = [
  { channel: '#signups', id: 'B074BSCRYBY/oje0JD1ymgzB6ZTMNe0zBvRM' },
  { channel: '#events', id: 'B074JCLS16Z/F5Lst6mYkthtDwBeCehwGGFR' }
];

const getChannelId = (channel: string) => {
  return SLACK_CHANNELS.find((c) => c.channel === channel)?.id;
};

const sendSlackMessage = async ({
  channel,
  color = BRAND_COLOR,
  fields,
  text
}: {
  channel: string;
  color?: string;
  fields?: {
    short: boolean;
    title: string;
    value: string;
  }[];
  text: string;
}): Promise<void> => {
  return await axios.post(
    `${process.env.SLACK_WEBHOOK_URL}/${getChannelId(channel)}`,
    { channel, color, fallback: text, fields, pretext: text }
  );
};

export default sendSlackMessage;
