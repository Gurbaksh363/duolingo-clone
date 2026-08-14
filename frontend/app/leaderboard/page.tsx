'use client';
import { useEffect, useState } from 'react';
import { api, LeaderboardEntry } from '@/lib/api';
import PageLayout from '@/components/PageLayout';
import styles from './leaderboard.module.css';

const LEAGUE_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  Bronze: { emoji: '🥉', color: '#CD7F32', bg: '#FFF4E6' },
  Silver: { emoji: '🥈', color: '#A8A9AD', bg: '#F5F5F5' },
  Gold: { emoji: '🥇', color: '#FFD700', bg: '#FFFDE6' },
  Platinum: { emoji: '💍', color: '#E5E4E2', bg: '#F0F0FF' },
  Diamond: { emoji: '💎', color: '#1CB0F6', bg: '#E6F7FF' },
};

const RANK_COLORS = ['#FFC800', '#AFAFAF', '#CD7F32'];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard().then(setEntries).catch(console.error).finally(() => setLoading(false));
  }, []);

  const league = entries[0]?.league ?? 'Gold';
  const cfg = LEAGUE_CONFIG[league] ?? LEAGUE_CONFIG.Gold;

  return (
    <PageLayout>
      <div className={styles.content}>
        {/* League banner */}
        <div className={styles.leagueBanner} style={{ background: cfg.bg, borderColor: cfg.color }}>
          <div className={styles.leagueEmoji}>{cfg.emoji}</div>
          <div>
            <div className={styles.leagueName} style={{ color: cfg.color }}>{league} League</div>
            <div className={styles.leagueDesc}>Top 10 advance to the next league!</div>
          </div>
        </div>

        {/* List */}
        <div className={styles.listCard}>
          {loading ? (
            <div className={styles.loading}>Loading leaderboard…</div>
          ) : entries.length === 0 ? (
            <div className={styles.loading}>No data yet</div>
          ) : (
            entries.map((entry) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                isMe={entry.user_id === 1}
                rankColor={RANK_COLORS[entry.rank - 1]}
              />
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function LeaderboardRow({ entry, isMe, rankColor }: { entry: LeaderboardEntry; isMe: boolean; rankColor?: string }) {
  return (
    <div className={`${styles.row} ${isMe ? styles.rowMe : ''}`}>
      <div className={styles.rank} style={rankColor ? { color: rankColor, fontWeight: 900 } : {}}>
        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
      </div>
      <div className={styles.avatar}>
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt="" />
        ) : (
          <div className={styles.avatarDefault}>{entry.display_name.charAt(0)}</div>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{entry.display_name} {isMe && <span className={styles.youBadge}>YOU</span>}</div>
        <div className={styles.streak}>🔥 {entry.streak} day streak</div>
      </div>
      <div className={styles.xp}>
        <span className={styles.xpVal}>⚡{entry.xp_total.toLocaleString()}</span>
        <span className={styles.xpLabel}>XP</span>
      </div>
    </div>
  );
}
