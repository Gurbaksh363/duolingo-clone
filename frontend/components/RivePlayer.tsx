'use client';

import React, { useEffect } from 'react';
import { useRive } from '@rive-app/react-canvas';

export default function RivePlayer({ src }: { src: string }) {
  const { RiveComponent, rive } = useRive({
    src,
    autoplay: true,
  });

  useEffect(() => {
    if (rive) {
      const states = rive.stateMachineNames;
      const anims = rive.animationNames;
      if (states && states.length > 0) {
        rive.play(states[0]);
      } else if (anims && anims.length > 0) {
        rive.play(anims[0]);
      }
    }
  }, [rive]);

  return <RiveComponent style={{ width: '100%', height: '100%' }} />;
}
