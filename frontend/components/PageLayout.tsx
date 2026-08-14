import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import styles from './PageLayout.module.css';

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.scrollArea}>
        <div className={styles.mainContainer}>
          <main className={styles.mainContent}>
            {children}
          </main>
          <aside className={styles.rightSidebarWrapper}>
            <RightSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
