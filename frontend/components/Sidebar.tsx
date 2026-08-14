'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/learn',        label: 'LEARN',        icon: '/icons/sidebar-learn.svg' },
  { href: '/leaderboard',  label: 'LEADERBOARDS', icon: '/icons/sidebar-leaderboard.svg' },
  { href: '/shop',         label: 'SHOP',         icon: '/icons/sidebar-shop.svg' },
  { href: '/profile',      label: 'PROFILE',      icon: '/icons/avatar-placeholder.svg' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppStore();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <Link href="/learn" className={styles.logo}>
        <Image src="/icons/logo-full.svg" alt="Duolingo" width={160} height={40} priority />
      </Link>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
            >
              <Image src={item.icon} alt={item.label} width={32} height={32} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User stats */}
      {user && (
        <div className={styles.userStats}>
          <div className={styles.statRow}>
            <Image src="/icons/streak-active.svg" alt="streak" width={22} height={22} />
            <span className={styles.statValue}>{user.streak}</span>
            <span className={styles.statLabel}>day streak</span>
          </div>
          <div className={styles.statRow}>
            <Image src="/icons/xp-bolt.svg" alt="xp" width={22} height={22} />
            <span className={styles.statValue}>{user.xp_total}</span>
            <span className={styles.statLabel}>total XP</span>
          </div>
          <div className={styles.statRow}>
            <Image src="/icons/gems.svg" alt="gems" width={22} height={22} />
            <span className={styles.statValue}>{user.gems}</span>
            <span className={styles.statLabel}>gems</span>
          </div>
        </div>
      )}

      {/* Super Duolingo promo */}
      <div className={styles.superPromo}>
        <div className={styles.superTitle}>Try Super!</div>
        <div className={styles.superDesc}>No ads, unlimited hearts</div>
        <button className={styles.superBtn}>Coming Soon</button>
      </div>
    </aside>
  );
}
