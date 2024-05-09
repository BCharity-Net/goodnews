import type { FC, ReactNode } from 'react';

import Video from '@components/Shared/Video';
import { GOOD_API_URL } from '@good/data/constants';
import { Card, Spinner, Tooltip } from '@good/ui';
import getAuthApiHeaders from '@helpers/getAuthApiHeaders';
import {
  ClipboardDocumentIcon,
  SignalIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon
} from '@heroicons/react/24/outline';
import { XCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { usePublicationLiveStore } from 'src/store/non-persisted/publication/usePublicationLiveStore';

interface WrapperProps {
  children: ReactNode;
}

const Wrapper: FC<WrapperProps> = ({ children }) => {
  return (
    <Card className="flex justify-center p-3 font-bold hover:bg-gray-50 dark:hover:bg-gray-900">
      <div className="flex items-center space-x-2">{children}</div>
    </Card>
  );
};

const LivestreamEditor: FC = () => {
  const {
    liveVideoConfig,
    resetLiveVideoConfig,
    setLiveVideoConfig,
    setShowLiveVideoEditor
  } = usePublicationLiveStore();

  const [screen, setScreen] = useState<'create' | 'record'>('create');
  const [creating, setCreating] = useState(false);

  const createLiveStream = async (record: boolean) => {
    try {
      setCreating(true);
      const response = await axios.post(
        `${GOOD_API_URL}/live/create`,
        { record },
        { headers: getAuthApiHeaders() }
      );
      const { data } = response;
      setLiveVideoConfig({
        id: data.result.id,
        playbackId: data.result.playbackId,
        streamKey: data.result.streamKey
      });
    } catch {
      toast.error('Error creating live stream');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="m-5 px-5 py-3" forceRounded>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <VideoCameraIcon className="size-4" />
          <b>Go Live</b>
        </div>
        <div className="flex items-center space-x-3">
          <Tooltip content="Delete" placement="top">
            <button
              className="flex"
              onClick={() => {
                resetLiveVideoConfig();
                setShowLiveVideoEditor(false);
              }}
              type="button"
            >
              <XCircleIcon className="size-5 text-red-400" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {creating ? (
          <Wrapper>
            <Spinner size="xs" />
            <div>Creating Live Stream...</div>
          </Wrapper>
        ) : liveVideoConfig.playbackId.length > 0 ? (
          <>
            <Card className="space-y-2 p-3">
              <div className="flex items-center space-x-1">
                <b>Stream URL:</b>
                <div className="">rtmp://rtmp.bcharity.net/live</div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      'rtmp://rtmp.bcharity.net/live'
                    );
                    toast.success('Copied to clipboard!');
                  }}
                  type="button"
                >
                  <ClipboardDocumentIcon className="size-4 text-gray-400" />
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <b>Stream Key:</b>
                <div className="">{liveVideoConfig.streamKey}</div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      liveVideoConfig.streamKey
                    );
                    toast.success('Copied to clipboard!');
                  }}
                  type="button"
                >
                  <ClipboardDocumentIcon className="size-4 text-gray-400" />
                </button>
              </div>
            </Card>
            <Video
              src={`https://livepeercdn.studio/hls/${liveVideoConfig.playbackId}/index.m3u8`}
            />
          </>
        ) : screen === 'create' ? (
          <button
            className="w-full"
            onClick={() => setScreen('record')}
            type="button"
          >
            <Wrapper>
              <SignalIcon className="size-5" />
              <div>Create Live Stream</div>
            </Wrapper>
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              className="w-full"
              onClick={() => createLiveStream(true)}
              type="button"
            >
              <Wrapper>
                <VideoCameraIcon className="size-5" />
                <div>Record</div>
              </Wrapper>
            </button>
            <button
              className="w-full"
              onClick={() => createLiveStream(false)}
              type="button"
            >
              <Wrapper>
                <VideoCameraSlashIcon className="size-5" />
                <div>Don't Record</div>
              </Wrapper>
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LivestreamEditor;
