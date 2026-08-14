'use client';
import Image from "next/image";
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Lottie from 'lottie-react';
import owlWalkingAnimation from '@/public/animations/owl-walking.json';
import lessonCompleteAnimation from '@/public/animations/lesson-complete.json';
import { api, Exercise, LessonData } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import styles from './lesson.module.css';
import RivePlayer from '@/components/RivePlayer';
import SpeakerIcon from '@/components/SpeakerIcon';

type FeedbackState = 'none' | 'correct' | 'wrong';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id);
  const updateUser = useAppStore((state) => state.updateUser);
  const router = useRouter();

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [answer, setAnswer] = useState<string>('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [matchLeft, setMatchLeft] = useState<string[]>([]);
  const [matchRight, setMatchRight] = useState<string[]>([]);
  const [matchSelected, setMatchSelected] = useState<string | null>(null);
  const [matchWrong, setMatchWrong] = useState<[string, string] | null>(null);
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [correctPairs, setCorrectPairs] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeData, setCompleteData] = useState<{ xp: number; streak: number; achievements: Array<{ name: string; icon: string }> } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch lesson
  useEffect(() => {
    api.getUser(1).then((u) => setHearts(u.hearts)).catch(() => {});
    const fetchPromise = api.getLessonExercises(lessonId).then(setLessonData).catch(console.error);
    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    Promise.all([fetchPromise, minDelayPromise])
      .finally(() => setLoading(false));
  }, [lessonId]);

  const exercise: Exercise | null = lessonData?.exercises[currentIdx] ?? null;

  // Reset per-exercise state
  useEffect(() => {
    if (!exercise) return;
    setFeedback('none');
    setAnswer('');
    setSelectedWords([]);
    setMatchSelected(null);

    if (exercise.type === 'match_pairs') {
      const pairs: Record<string, string> = JSON.parse(exercise.correct_answer);
      const lefts = Object.keys(pairs).map(k => `L:${k}`);
      const rights = Object.values(pairs).map(v => `R:${v}`);
      setMatchLeft(shuffle(lefts));
      setMatchRight(shuffle(rights));
      setMatchPairs(pairs);
      setCorrectPairs(new Set());
      setMatchWrong(null);
    }
  }, [currentIdx, exercise?.id]);

  const progress = lessonData ? ((currentIdx) / lessonData.exercises.length) * 100 : 0;

  // ── Answer checking ───────────────────────────────────────────────────────

  const checkAnswer = useCallback(() => {
    if (!exercise || feedback !== 'none') return;

    let userAnswer = '';
    if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') {
      userAnswer = answer;
    } else if (exercise.type === 'translate') {
      userAnswer = selectedWords.join(' ');
    } else if (exercise.type === 'type_answer') {
      userAnswer = answer;
    } else if (exercise.type === 'match_pairs') {
      // Check if all pairs are correct
      if (correctPairs.size >= Object.keys(matchPairs).length * 2) {
        setFeedback('correct');
      }
      return;
    }

    const correct = exercise.correct_answer.trim().toLowerCase();
    const user = userAnswer.trim().toLowerCase();

    if (correct === user) {
      setFeedback('correct');
      new Audio('/audio/answer-correct.mp3').play().catch(() => {});
    } else {
      setFeedback('wrong');
      new Audio('/audio/answer-wrong.mp3').play().catch(() => {});
      setMistakes((m) => m + 1);
      setHearts((h) => Math.max(0, h - 1));
      api.deductHeart(1).catch(console.error); // Sync with backend immediately
    }
  }, [exercise, feedback, answer, selectedWords, correctPairs, matchPairs]);

  const handleContinue = () => {
    if (!lessonData) return;
    if (feedback === 'none') { checkAnswer(); return; }

    const nextIdx = currentIdx + 1;
    if (nextIdx >= lessonData.exercises.length) {
      // Lesson complete
      finishLesson();
    } else {
      setCurrentIdx(nextIdx);
    }
  };

  const finishLesson = async () => {
    new Audio('/audio/lesson-complete.mp3').play().catch(() => {});
    try {
      const result = await api.completeLesson({ user_id: 1, lesson_id: lessonId, mistakes, xp_earned: 10 });
      if (updateUser) {
        const today = new Date().toISOString().split('T')[0];
        updateUser({ xp_total: result.new_xp_total, streak: result.streak, hearts: result.hearts_remaining, last_activity_date: today });
      }
      setCompleteData({
        xp: result.xp_earned,
        streak: result.streak,
        achievements: result.achievements_earned,
      });
      setShowCompleteModal(true);
    } catch (e) {
      console.error('Failed to complete lesson:', e);
      setCompleteData({
        xp: 10,
        streak: 1,
        achievements: [],
      });
      setShowCompleteModal(true);
    }
  };

  // Word bank toggle
  const toggleWord = (word: string) => {
    setSelectedWords((prev) => {
      const idx = prev.indexOf(word);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, word];
    });
  };

  // Match pairs logic
  const handleMatchClick = (value: string, side: 'left' | 'right') => {
    if (correctPairs.has(value)) return;
    if (matchSelected === value) {
      setMatchSelected(null);
      return;
    }
    if (matchSelected === null) {
      setMatchSelected(value);
    } else {
      const l = value.startsWith('L:') ? value : matchSelected;
      const r = value.startsWith('R:') ? value : matchSelected;

      // If they clicked two buttons on the same side, switch selection
      if (l.startsWith('L:') && r.startsWith('R:')) {
        const leftKey = l.slice(2);
        const expectedRight = `R:${matchPairs[leftKey]}`;

        if (expectedRight === r) {
          new Audio('/audio/answer-correct.mp3').play().catch(() => {});
          setCorrectPairs((prev) => new Set([...prev, l, r]));
          // Check if all pairs matched
          const newCorrect = new Set([...correctPairs, l, r]);
          if (newCorrect.size >= Object.keys(matchPairs).length * 2) {
            setTimeout(() => setFeedback('correct'), 300);
          }
        } else {
          // Flash wrong
          new Audio('/audio/answer-wrong.mp3').play().catch(() => {});
          setMistakes((m) => m + 1);
          setHearts((h) => Math.max(0, h - 1));
          api.deductHeart(1).catch(console.error); // Sync with backend immediately
          setMatchWrong([l, r]);
          setTimeout(() => setMatchWrong(null), 500);
        }
        setMatchSelected(null);
      } else {
        setMatchSelected(value);
      }
    }
  };

  const canCheck = (() => {
    if (!exercise || feedback !== 'none') return true; // show continue
    if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') return answer !== '';
    if (exercise.type === 'translate') return selectedWords.length > 0;
    if (exercise.type === 'type_answer') return answer.trim() !== '';
    if (exercise.type === 'match_pairs') return correctPairs.size >= Object.keys(matchPairs).length * 2;
    return false;
  })();

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div style={{ width: 220, height: 220, marginBottom: '1rem' }}>
        <Lottie animationData={owlWalkingAnimation} loop={true} />
      </div>
      <h2 className={styles.loadingTitle}>Loading...</h2>
      <p className={styles.loadingFact}>
        Did you know? Spanish is the second most spoken native language in the world, with over 485 million native speakers!
      </p>
      <div className={styles.loadingBar}>
        <div className={styles.loadingBarInner} />
      </div>
    </div>
  );

  if (!lessonData || !exercise) return null;

  return (
    <div className={styles.lessonWrap}>
      {/* Exit modal */}
      {showExitModal && (
        <ExitModal onStay={() => setShowExitModal(false)} onExit={() => { router.push('/learn'); router.refresh(); }} />
      )}

      {/* Complete modal */}
      {showCompleteModal && completeData && (
        <CompleteModal data={completeData} onContinue={() => { router.push('/learn'); router.refresh(); }} />
      )}

      {/* Hearts = 0 modal */}
      {hearts <= 0 && !showCompleteModal && (
        <NoHeartsModal onRefill={() => router.push('/shop')} onExit={() => { router.push('/learn'); router.refresh(); }} />
      )}

      {/* ── Top bar ── */}
      <header className={styles.lessonHeader}>
        <button className={styles.exitBtn} onClick={() => setShowExitModal(true)}>
          <Image src="https://d35aaqx5ub95lt.cloudfront.net/images/4af31393cf9dee6fd35c07fc7155d404.svg" alt="quit" width={18} height={18} />
        </button>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}>
              <div className={styles.progressShine} />
            </div>
          </div>
        </div>
        <div className={styles.heartsDisplay}>
          <Image src="https://d35aaqx5ub95lt.cloudfront.net/images/hearts/7631e3ee734dd4fe7792626b59457fa4.svg" alt="heart" width={28} height={28} className={styles.heartImg} />
          <span className={styles.heartCount}>{hearts}</span>
        </div>
      </header>

      {/* ── Exercise area ── */}
      <main className={styles.exerciseArea}>
        {/* Question */}
        <div className={styles.questionBlock}>
          <h1 className={styles.questionTitle}>{exercise.question}</h1>
        </div>

        {/* Character & Speech Bubble (For Translate/Fill in blank type questions) */}
        {exercise.character_animation && exercise.character_animation !== 'null' && (
          <div className={styles.characterRow}>
            <div className={styles.characterContainer}>
               <RivePlayer src={`/animations/${exercise.character_animation}`} /> 
            </div>
            <div className={styles.speechBubbleContainer}>
              <div className={styles.speechBubble}>
                <div className={styles.speechText}>
                   <div className={styles.speakerIconWrap}>
                     <SpeakerIcon className={styles.speakerIcon} />
                   </div>
                   <span>{exercise.hint}</span>
                </div>
                <div className={styles.speechTail}></div>
              </div>
            </div>
          </div>
        )}

        {/* Exercise body */}
        <div className={styles.exerciseBody}>
          {exercise.type === 'multiple_choice' && (
            <MultipleChoice exercise={exercise} answer={answer} feedback={feedback} onSelect={setAnswer} />
          )}
          {exercise.type === 'fill_blank' && (
            <FillBlank exercise={exercise} answer={answer} feedback={feedback} onSelect={setAnswer} />
          )}
          {exercise.type === 'translate' && (
            <TranslateExercise
              exercise={exercise}
              selectedWords={selectedWords}
              feedback={feedback}
              onToggle={toggleWord}
            />
          )}
          {exercise.type === 'type_answer' && (
            <TypeAnswer exercise={exercise} answer={answer} feedback={feedback} onChange={setAnswer} onSubmit={handleContinue} />
          )}
          {exercise.type === 'match_pairs' && (
            <MatchPairs
              matchLeft={matchLeft}
              matchRight={matchRight}
              matchPairs={matchPairs}
              correctPairs={correctPairs}
              selected={matchSelected}
              wrongPair={matchWrong}
              feedback={feedback}
              onClickLeft={(v) => handleMatchClick(v, 'left')}
              onClickRight={(v) => handleMatchClick(v, 'right')}
            />
          )}
        </div>
      </main>

      {/* ── Feedback bar + check button ── */}
      <footer className={`${styles.lessonFooter} ${feedback === 'correct' ? styles.footerCorrect : feedback === 'wrong' ? styles.footerWrong : ''}`}>
        {feedback === 'correct' && (
          <div className={styles.feedbackLeft}>
            <div className={styles.feedbackIcon}>
              <Image src="/icons/tick-green.svg" alt="correct" width={22} height={22} />
            </div>
            <div>
              <div className={styles.feedbackTitle}>Correct!</div>
              <div className={styles.feedbackSub}>Great job! 🎉</div>
            </div>
          </div>
        )}
        {feedback === 'wrong' && (
          <div className={styles.feedbackLeft}>
            <div className={styles.feedbackIcon}>
              <Image src="/icons/cross-red.svg" alt="wrong" width={22} height={22} />
            </div>
            <div>
              <div className={styles.feedbackTitle}>Correct answer:</div>
              <div className={styles.feedbackAnswer}>{exercise.correct_answer}</div>
            </div>
          </div>
        )}
        {feedback === 'none' && (
          <div className={styles.feedbackLeft}>
            <button className={styles.skipBtn} onClick={handleContinue}>
              Skip
            </button>
          </div>
        )}

        <button
          className={`${styles.checkBtn} ${feedback === 'correct' ? styles.checkBtnCorrect : feedback === 'wrong' ? styles.checkBtnWrong : ''}`}
          onClick={handleContinue}
          disabled={!canCheck}
        >
          {feedback === 'none' ? 'Check' : 'Continue'}
        </button>
      </footer>
    </div>
  );
}

// ─── Exercise components ───────────────────────────────────────────────────────

function MultipleChoice({ exercise, answer, feedback, onSelect }: { exercise: Exercise; answer: string; feedback: FeedbackState; onSelect: (v: string) => void }) {
  return (
    <div className={styles.optionGrid}>
      {exercise.options.map((opt) => {
        const isSelected = answer === opt;
        const isCorrect = opt === exercise.correct_answer;
        let cls = styles.option;
        if (feedback !== 'none' && isCorrect) cls += ` ${styles.optionCorrect}`;
        else if (feedback !== 'none' && isSelected && !isCorrect) cls += ` ${styles.optionWrong}`;
        else if (feedback === 'none' && isSelected) cls += ` ${styles.optionSelected}`;
        return (
          <button key={opt} className={cls} onClick={() => feedback === 'none' && onSelect(opt)} disabled={feedback !== 'none'}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FillBlank({ exercise, answer, feedback, onSelect }: { exercise: Exercise; answer: string; feedback: FeedbackState; onSelect: (v: string) => void }) {
  return (
    <div className={styles.optionGrid}>
      {exercise.options.map((opt) => {
        const isSelected = answer === opt;
        const isCorrect = opt === exercise.correct_answer;
        let cls = styles.option;
        if (feedback !== 'none' && isCorrect) cls += ` ${styles.optionCorrect}`;
        else if (feedback !== 'none' && isSelected && !isCorrect) cls += ` ${styles.optionWrong}`;
        else if (feedback === 'none' && isSelected) cls += ` ${styles.optionSelected}`;
        return (
          <button key={opt} className={cls} onClick={() => feedback === 'none' && onSelect(opt)} disabled={feedback !== 'none'}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TranslateExercise({ exercise, selectedWords, feedback, onToggle }: { exercise: Exercise; selectedWords: string[]; feedback: FeedbackState; onToggle: (w: string) => void }) {
  return (
    <div className={styles.translateWrap}>
      {/* Answer area */}
      <div className={`${styles.answerArea} ${feedback === 'correct' ? styles.answerCorrect : feedback === 'wrong' ? styles.answerWrong : ''}`}>
        {selectedWords.length === 0 ? (
          <span className={styles.answerPlaceholder}>Tap the words</span>
        ) : (
          selectedWords.map((w, i) => (
            <button key={i} className={styles.wordChipSelected} onClick={() => feedback === 'none' && onToggle(w)}>
              {w}
            </button>
          ))
        )}
      </div>

      {/* Word bank */}
      <div className={styles.wordBank}>
        {exercise.word_bank.map((word) => {
          const used = selectedWords.includes(word);
          return (
            <button
              key={word}
              className={`${styles.wordChip} ${used ? styles.wordChipUsed : ''}`}
              onClick={() => feedback === 'none' && onToggle(word)}
              disabled={feedback !== 'none'}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeAnswer({ exercise, answer, feedback, onChange, onSubmit }: { exercise: Exercise; answer: string; feedback: FeedbackState; onChange: (v: string) => void; onSubmit: () => void }) {
  return (
    <div className={styles.typeWrap}>
      <input
        className={`${styles.typeInput} ${feedback === 'correct' ? styles.inputCorrect : feedback === 'wrong' ? styles.inputWrong : ''}`}
        type="text"
        value={answer}
        onChange={(e) => feedback === 'none' && onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Type your answer…"
        autoFocus
        disabled={feedback !== 'none'}
      />
    </div>
  );
}

function MatchPairs({ matchLeft, matchRight, matchPairs, correctPairs, selected, wrongPair, feedback, onClickLeft, onClickRight }: {
  matchLeft: string[]; matchRight: string[]; matchPairs: Record<string, string>;
  correctPairs: Set<string>; selected: string | null; wrongPair: [string, string] | null; feedback: FeedbackState;
  onClickLeft: (v: string) => void; onClickRight: (v: string) => void;
}) {
  return (
    <div className={styles.matchWrap}>
      <div className={styles.matchCol}>
        {matchLeft.map((w) => {
          const done = correctPairs.has(w);
          const sel = selected === w;
          const isWrong = wrongPair && (wrongPair[0] === w || wrongPair[1] === w);
          return (
            <button
              key={w}
              className={`${styles.matchChip} ${done ? styles.matchCorrect : isWrong ? styles.matchWrong : sel ? styles.matchSelected : ''}`}
              onClick={() => !done && onClickLeft(w)}
              disabled={done}
            >
              {w.slice(2)}
            </button>
          );
        })}
      </div>
      <div className={styles.matchCol}>
        {matchRight.map((w) => {
          const done = correctPairs.has(w);
          const sel = selected === w;
          const isWrong = wrongPair && (wrongPair[0] === w || wrongPair[1] === w);
          return (
            <button
              key={w}
              className={`${styles.matchChip} ${done ? styles.matchCorrect : isWrong ? styles.matchWrong : sel ? styles.matchSelected : ''}`}
              onClick={() => !done && onClickRight(w)}
              disabled={done}
            >
              {w.slice(2)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ExitModal({ onStay, onExit }: { onStay: () => void; onExit: () => void }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox} style={{ maxWidth: 360, textAlign: 'center', padding: '32px 24px' }}>
        <Image src="/icons/quit-owl.svg" alt="Wait, don't go!" width={130} height={130} style={{ margin: '0 auto 24px', display: 'block' }} />
        <h2 style={{ fontSize: 22, color: '#4b4b4b', marginBottom: 32, lineHeight: 1.4 }}>Wait, don’t go! You’ll lose your progress if you quit now</h2>
        <button className="btn btn-primary w-full" style={{ marginBottom: 16, color: '#fff' }} onClick={onStay}>Keep learning</button>
        <button className="btn w-full" style={{ color: '#ff4b4b', background: 'transparent', border: 'none', boxShadow: 'none', fontSize: 16, fontWeight: 700 }} onClick={onExit}>End session</button>
      </div>
    </div>
  );
}

function CompleteModal({ data, onContinue }: { data: { xp: number; streak: number; achievements: Array<{ name: string; icon: string }> }; onContinue: () => void }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div style={{ width: 160, margin: '0 auto 12px' }}>
          <Lottie animationData={lessonCompleteAnimation} loop={true} />
        </div>
        <h2 style={{ fontSize: 24, color: '#58CC02' }}>Lesson Complete!</h2>
        <p style={{ color: '#777', marginBottom: 20 }}>Amazing work! 🎉</p>

        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <Image src="/icons/xp-bolt.svg" alt="XP" width={28} height={28} style={{ margin: '0 auto 4px', display: 'block' }} />
            <div className={styles.statBoxVal}>{data.xp}</div>
            <div className={styles.statBoxLabel}>Total XP</div>
          </div>
          <div className={styles.statBox}>
            <Image src="/icons/streak-active.svg" alt="Streak" width={28} height={28} style={{ margin: '0 auto 4px', display: 'block' }} />
            <div className={styles.statBoxVal}>{data.streak}</div>
            <div className={styles.statBoxLabel}>Day Streak</div>
          </div>
        </div>

        {data.achievements.length > 0 && (
          <div className={styles.achievements}>
            <div className={styles.achievementsTitle}>🏆 Achievements Earned!</div>
            {data.achievements.map((a) => (
              <div key={a.name} className={styles.achievementRow}>
                <span>{a.icon}</span>
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-primary w-full" style={{ marginTop: 20, color: '#fff' }} onClick={onContinue}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}

function NoHeartsModal({ onRefill, onExit }: { onRefill: () => void; onExit: () => void }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <Image src="/icons/heart-empty.svg" alt="" width={60} height={60} style={{ margin: '0 auto 12px', display: 'block', filter: 'grayscale(1) opacity(0.6)' }} />
        <h2>You ran out of hearts!</h2>
        <p style={{ color: '#777', margin: '12px 0 24px' }}>Refill your hearts to continue</p>
        <button className="btn btn-danger w-full" style={{ marginBottom: 12, color: '#fff' }} onClick={onRefill}>💎 Refill Hearts</button>
        <button className="btn btn-ghost w-full" onClick={onExit}>End Lesson</button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getTypeName(type: string) {
  const names: Record<string, string> = {
    multiple_choice: '🎯 Multiple Choice',
    translate: '🔤 Tap the Words',
    fill_blank: '✏️ Fill in the Blank',
    type_answer: '⌨️ Type the Answer',
    match_pairs: '🔗 Match Pairs',
  };
  return names[type] ?? type;
}
