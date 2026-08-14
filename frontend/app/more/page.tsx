import PageLayout from '@/components/PageLayout';

export default function PlaceholderPage() {
  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#4b4b4b', fontWeight: 'bold' }}>More</h1>
        <p style={{ color: '#777', marginTop: '1rem', fontSize: '1.2rem' }}>Coming Soon...</p>
      </div>
    </PageLayout>
  );
}
