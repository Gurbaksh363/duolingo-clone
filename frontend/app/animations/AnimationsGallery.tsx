'use client';

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useRive } from '@rive-app/react-canvas';

export default function AnimationsGallery({ files }: { files: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
      {files.map(file => (
        <AnimationCard key={file} file={file} />
      ))}
    </div>
  );
}

function AnimationCard({ file }: { file: string }) {
  const [animData, setAnimData] = useState<any>(null);
  const isRive = file.endsWith('.riv');

  useEffect(() => {
    if (!isRive) {
      fetch(`/animations/${file}`)
        .then(r => r.json())
        .then(setAnimData)
        .catch(console.error);
    }
  }, [file, isRive]);

  return (
    <div style={{ 
      border: '2px solid #e5e5e5', 
      borderRadius: '16px', 
      padding: '1.5rem', 
      width: '320px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      background: 'white'
    }}>
      <div style={{ height: '200px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isRive ? (
           <RiveWrapper file={file} />
        ) : animData ? (
          <Lottie animationData={animData} loop={true} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div style={{ color: '#afafaf', fontWeight: 'bold' }}>Loading...</div>
        )}
      </div>
      <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#4b4b4b', fontSize: '1rem', textAlign: 'center' }}>
        {file}
      </p>
    </div>
  );
}

function RiveWrapper({ file }: { file: string }) {
  const { RiveComponent, rive } = useRive({
    src: `/animations/${file}`,
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
