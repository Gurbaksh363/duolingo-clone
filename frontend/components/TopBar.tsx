'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, User } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user, setUser } = useAppStore();

  useEffect(() => {
    api.getUser(1).then(setUser).catch(() => {});
  }, [setUser]);

  if (!user) return <div className={styles.topbar} />;

  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = user.last_activity_date === today;
  const streakIcon = isActiveToday ? '/icons/streak-active.svg' : '/icons/streak-inactive.svg';
  const streakColor = isActiveToday ? '#FF9600' : '#AFAFAF';

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        {/* Course Flag */}
        <div className={styles.stat}>
          <Image src="/flags/es.svg" alt="Course" width={31} height={24} className={styles.flag} />
        </div>

        {/* Streak */}
        <Link href="/profile" className={styles.stat}>
          <Image src={streakIcon} alt="streak" width={24} height={24} />
          <span className={styles.statNum} style={{ color: streakColor }}>
            {user.streak}
          </span>
        </Link>

        {/* Gems */}
        <Link href="/shop" className={styles.stat}>
          <Image src="/icons/lingot-gem.svg" alt="gems" width={24} height={24} />
          <span className={styles.statNum} style={{ color: '#1CB0F6' }}>{user.gems}</span>
        </Link>

        {/* Hearts */}
        <Link href="/shop" className={styles.stat}>
          <Image src="/icons/heart-red.svg" alt="hearts" width={24} height={24} />
          <span className={styles.statNum} style={{ color: '#FF4B4B' }}>{user.hearts}</span>
        </Link>
      </div>
    </header>
  );
}
