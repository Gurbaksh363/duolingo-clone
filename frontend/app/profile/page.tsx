'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, UserStats } from '@/lib/api';
import PageLayout from '@/components/PageLayout';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUserStats(1).then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const user = stats?.user;
  const goalPct = user ? Math.min((user.daily_xp_earned / user.daily_xp_goal) * 100, 100) : 0;

  return (
    <PageLayout>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading profile…</div>
        ) : user ? (
          <>
            {/* Profile card */}
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" />
                ) : (
                  <div className={styles.avatarDefault}>
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.profileInfo}>
                <h1 className={styles.displayName}>{user.display_name}</h1>
                <div className={styles.username}>@{user.username}</div>
                <div className={styles.joinDate}>
                  <Image src="/icons/calendar.svg" alt="" width={14} height={14} />
                  {' '}Joined {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </div>
                <div className={styles.leagueBadge}>
                  {getLeagueEmoji(user.league)} {user.league} League
                </div>
              </div>
            </div>

            {/* Daily goal */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Daily Goal</div>
              <div className={styles.goalRow}>
                <span>⚡ {user.daily_xp_earned} / {user.daily_xp_goal} XP today</span>
                <span className={styles.goalPct}>{Math.round(goalPct)}%</span>
              </div>
              <div className={styles.goalBarOuter}>
                <div className={styles.goalBarInner} style={{ width: `${goalPct}%` }} />
              </div>
            </div>

            {/* Stats grid */}
            <div className={styles.statsGrid}>
              <StatTile icon="/icons/streak-active.svg" value={user.streak} label="Day Streak" color="#FF9600" />
              <StatTile icon="/icons/xp-bolt.svg" value={user.xp_total} label="Total XP" color="#FFC800" />
              <StatTile icon="/icons/achievement-streak.svg" value={user.longest_streak} label="Best Streak" color="#CE82FF" />
              <StatTile icon="/icons/gems.svg" value={user.gems} label="Gems" color="#1CB0F6" />
              <StatTile icon="/icons/heart-full.svg" value={user.hearts} label="Hearts" color="#FF4B4B" />
              <StatTile icon="/icons/skill-star.svg" value={stats.total_lessons_completed} label="Lessons Done" color="#58CC02" />
            </div>

            {/* Achievements */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Achievements</div>
              {stats.achievements.length === 0 ? (
                <p className={styles.emptyAchievements}>Complete lessons to earn achievements! 🎯</p>
              ) : (
                <div className={styles.achievementGrid}>
                  {stats.achievements.map((a) => (
                    <div key={a.name} className={styles.achievement}>
                      <div className={styles.achievementIcon}>{a.icon}</div>
                      <div className={styles.achievementName}>{a.name}</div>
                      <div className={styles.achievementDesc}>{a.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.loading}>Failed to load profile</div>
        )}
      </div>
    </PageLayout>
  );
}

function StatTile({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div className={styles.statTile}>
      <Image src={icon} alt={label} width={32} height={32} style={{ margin: '0 auto 6px', display: 'block' }} />
      <div className={styles.statTileValue} style={{ color }}>{value.toLocaleString()}</div>
      <div className={styles.statTileLabel}>{label}</div>
    </div>
  );
}

function getLeagueEmoji(league: string) {
  const map: Record<string, string> = {
    Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💍', Diamond: '💎', Obsidian: '🖤',
  };
  return map[league] ?? '🏆';
}
