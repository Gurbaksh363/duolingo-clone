import fs from 'fs';
import path from 'path';
import AnimationsGallery from './AnimationsGallery';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default async function AnimationsPage() {
  const animDir = path.join(process.cwd(), 'public', 'animations');
  
  let files: string[] = [];
  try {
    files = fs.readdirSync(animDir).filter(f => f.endsWith('.json') || f.endsWith('.riv'));
  } catch (err) {
    console.error('Error reading animations directory:', err);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '256px', padding: '3rem 4rem' }}>
        <h1 style={{ color: '#4b4b4b', fontSize: '2rem', fontWeight: 800 }}>Animations Gallery</h1>
        <p style={{ color: '#777', fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Preview all downloaded Lottie (.json) and Rive (.riv) animations in the <code style={{ background: '#e5e5e5', padding: '4px 8px', borderRadius: '8px' }}>public/animations</code> folder.
        </p>
        <AnimationsGallery files={files} />
      </div>
    </div>
  );
}
