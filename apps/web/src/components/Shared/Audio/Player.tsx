import React, { useState, useEffect, forwardRef } from 'react';
import 'plyr-react/plyr.css';
import { memo } from 'react';

interface PlayerProps {
  playerRef: React.Ref<any>;
  src: string;
}

const Player: React.FC<PlayerProps> = memo(
  forwardRef(({ src }, playerRef) => {
    const [Plyr, setPlyr] = useState<React.ElementType | null>(null);

    useEffect(() => {
      // 确保仅在客户端导入 Plyr
      if (typeof window !== 'undefined') {
        import('plyr-react').then((module) => {
          setPlyr(module.default);
        });
      }
    }, []);

    if (!Plyr) {
      // 在 Plyr 组件加载前显示加载中提示或返回 null
      return null; // 或可以显示一个加载提示符
    }

    return (
      <Plyr
        options={{
          controls: ['progress', 'current-time', 'mute', 'volume']
        }}
        ref={playerRef}
        source={{ sources: [{ src }], type: 'audio' }}
      />
    );
  })
);

export default Player;
