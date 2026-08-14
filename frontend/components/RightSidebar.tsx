import Image from 'next/image';
import Link from 'next/link';
import TopBar from './TopBar';
import styles from './RightSidebar.module.css';

export default function RightSidebar() {
  return (
    <aside className={styles.rightSidebar}>
      <div className={styles.desktopTopBar}>
        <TopBar />
      </div>
      <TrySuperCard />
      <DiamondLeagueCard />
    </aside>
  );
}

function TrySuperCard() {
  return (
    <div className={styles.sideCard}>
      <div className={styles.superImagesRow}>
        <Image src="/icons/super-logo.svg" alt="Super" width={78} height={20} />
        <Image src="/icons/super-illustration.svg" alt="Illustration" width={80} height={80} className={styles.superIllustration} />
      </div>
      <div className={styles.superContent}>
        <h2 className={styles.superTitle}>Try Super for free</h2>
        <div className={styles.superDesc}>No ads, personalized practice, and unlimited Legendary!</div>
        <button className={styles.superBtn}>Try 1 week free</button>
      </div>
    </div>
  );
}

function DiamondLeagueCard() {
  return (
    <div className={styles.sideCard}>
      <div className={styles.leagueHeader}>
        <h2 className={styles.leagueTitle}>Diamond League</h2>
        <Link href="/leaderboard" className={styles.leagueLink}>View League</Link>
      </div>
      <div className={styles.leagueBody}>
        <div className={styles.leagueIconWrapper}>
          <Image src="/icons/diamond-league.svg" alt="Diamond League" width={50} height={56} />
        </div>
        <div className={styles.leagueTextWrapper}>
          <p className={styles.leagueRank}>You're ranked <span>#3</span></p>
          <span className={styles.leagueCaption}>Keep it up to stay in the top 3!</span>
        </div>
      </div>
    </div>
  );
}
