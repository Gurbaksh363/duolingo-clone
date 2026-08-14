'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import PageLayout from '@/components/PageLayout';
import styles from './shop.module.css';

export default function ShopPage() {
  const { user, setUser, updateUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.getUser(1).then(setUser).catch(() => {});
  }, [setUser]);

  const refillHearts = async () => {
    if (!user || user.hearts >= user.max_hearts) return;
    setLoading(true);
    try {
      const result = await api.refillHearts(1);
      updateUser({ hearts: result.hearts, gems: result.gems });
      showToast('❤️ Hearts refilled!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(msg.includes('gems') ? '💎 Not enough gems!' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const buyGems = async (amount: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await api.buyGems(1, amount);
      updateUser({ gems: result.gems });
      showToast(`💎 Purchased ${amount} gems!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <PageLayout>
      {toast && <div className={styles.toast}>{toast}</div>}
      <div className={styles.content}>
          <div className={styles.header}>
            <h1>Shop</h1>
            {user && (
              <div className={styles.gemBalance}>
                <span>💎</span>
                <span>{user.gems} Gems</span>
              </div>
            )}
          </div>

          {/* Hearts section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Hearts</div>
            <div className={styles.itemCard}>
              <div className={styles.itemLeft}>
                <div className={styles.itemIcon}>❤️</div>
                <div>
                  <div className={styles.itemName}>Heart Refill</div>
                  <div className={styles.itemDesc}>Refill your hearts to {user?.max_hearts ?? 5}</div>
                  {user && (
                    <div className={styles.heartsDisplay}>
                      {'❤️'.repeat(user.hearts)}{'🖤'.repeat(user.max_hearts - user.hearts)}
                      <span style={{ marginLeft: 8, color: '#777', fontSize: 13 }}>
                        {user.hearts}/{user.max_hearts}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className={styles.buyBtn}
                onClick={refillHearts}
                disabled={loading || (user?.hearts ?? 0) >= (user?.max_hearts ?? 5)}
              >
                {user?.hearts === user?.max_hearts ? '✓ Full' : loading ? '…' : '💎 350'}
              </button>
            </div>
          </div>

          {/* Gems section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Gems</div>
            <div className={styles.gemsGrid}>
              {[
                { amount: 200,  price: '$1.99',  emoji: '💎' },
                { amount: 500,  price: '$4.99',  emoji: '💎💎' },
                { amount: 1000, price: '$8.99',  emoji: '💎💎💎' },
                { amount: 2000, price: '$14.99', emoji: '💎💎💎💎' },
              ].map((gem) => (
                <div key={gem.amount} className={styles.gemCard}>
                  <div className={styles.gemEmoji}>{gem.emoji}</div>
                  <div className={styles.gemAmount}>{gem.amount} Gems</div>
                  <button 
                    className={styles.gemBuyBtn} 
                    onClick={() => buyGems(gem.amount)}
                    disabled={loading}
                  >
                    {gem.price}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Super Duolingo */}
          <div className={styles.superCard}>
            <div className={styles.superLeft}>
              <div style={{ fontSize: 40 }}>🦜✨</div>
              <div>
                <div className={styles.superTitle}>Super Duolingo</div>
                <div className={styles.superDesc}>No ads · Unlimited hearts · Legendary challenges</div>
              </div>
            </div>
            <button className={styles.superBtn} onClick={() => showToast('Coming soon! 🚀')}>
              Coming Soon
            </button>
          </div>
        </div>
    </PageLayout>
  );
}
