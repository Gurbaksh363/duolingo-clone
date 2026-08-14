'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, Skill } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import styles from './SkillModal.module.css';

interface Props {
  skill: Skill;
  unitColor: string;
  onClose: () => void;
  isLocked?: boolean;
}

interface LessonItem {
  id: number;
  order: number;
  title: string;
  xp_reward: number;
  is_completed: boolean;
}

export default function SkillModal({ skill, unitColor, onClose, isLocked }: Props) {
  const router = useRouter();
  const setCurrentLesson = useAppStore((s) => s.setCurrentLesson);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  useEffect(() => {
    api.getSkillLessons(skill.id, 1)
      .then(setLessons)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [skill.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const startLesson = (lesson: LessonItem) => {
    setCurrentLesson(lesson.id, skill.id);
    router.push(`/lesson/${lesson.id}`);
    handleClose();
  };

  const nextLesson = lessons.find((l) => !l.is_completed) || lessons[0];

  if (isLocked) {
    return (
      <div className={`${styles.tooltip} ${styles.tooltipLocked} ${isClosing ? styles.closing : ''}`} ref={tooltipRef}>
          <div className={`${styles.arrow} ${styles.arrowLocked}`} />
          <div className={styles.headerLocked}>
            <h2 className={styles.titleLocked}>{skill.name}</h2>
            <p className={styles.descLocked}>Complete all levels above to unlock this!</p>
          </div>
          <div className={styles.footer}>
            <button className={styles.lockedBtn} disabled>LOCKED</button>
          </div>
        </div>
    );
  }

  return (
    <div className={`${styles.tooltip} ${isClosing ? styles.closing : ''}`} style={{ background: unitColor }} ref={tooltipRef}>
        {/* Tooltip Arrow */}
        <div className={styles.arrow} style={{ borderBottomColor: unitColor }} />
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{skill.name}</h2>
          <p className={styles.progressText}>
            Lesson {Math.min(skill.completed_lessons + 1, skill.total_lessons)} of {skill.total_lessons}
          </p>
        </div>

        {/* CTA */}
        <div className={styles.footer}>
          {skill.is_completed ? (
            <button
              className={styles.startBtn}
              style={{ color: unitColor }}
              onClick={() => nextLesson && startLesson(nextLesson)}
            >
              PRACTICE +5 XP
            </button>
          ) : (
            <button
              className={styles.startBtn}
              style={{ color: unitColor }}
              onClick={() => nextLesson && startLesson(nextLesson)}
              disabled={!nextLesson}
            >
              START +10 XP
            </button>
          )}
        </div>
      </div>
  );
}
