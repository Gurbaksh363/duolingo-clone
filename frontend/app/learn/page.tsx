'use client';
import { useEffect, useState, useRef, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Lottie from 'lottie-react';
import owlUnitA2 from '@/public/animations/owl-unit-a2.json';
import owlUnitB2 from '@/public/animations/owl-unit-b2.json';
import duoTwirlData from '../../public/animations/duo-twirl.json';
import eddyBasketballData from '../../public/animations/eddy-basketball.json';
import oscarFlowerData from '../../public/animations/oscar-flower.json';
import { api, Unit, Skill } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import SkillModal from '@/components/SkillModal';
import RightSidebar from '@/components/RightSidebar';
import styles from './learn.module.css';

// Sinusoidal path offsets like real Duolingo
const PATH_OFFSETS = [0, 60, 100, 80, 20, -40, -80, -60, 0, 40, 90, 80, 20, -30, -70, -50];

// Banner animations for each unit (loops if more units than banners)
const SECTION_ANIMATIONS = [
  duoTwirlData,
  owlUnitA2,
  oscarFlowerData,
  owlUnitB2,
];

export default function LearnPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSkillUnitColor, setSelectedSkillUnitColor] = useState('#58CC02');
  const [activeHeaderUnit, setActiveHeaderUnit] = useState<Unit | null>(null);

  useEffect(() => {
    api.getLearningPath('es', 1)
      .then(setUnits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!units || units.length === 0) return;
    
    // Default to first unit
    if (!activeHeaderUnit) setActiveHeaderUnit(units[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const unitId = Number(entry.target.id.replace('unit-', ''));
            const unit = units.find(u => u.id === unitId);
            if (unit) setActiveHeaderUnit(unit);
          }
        });
      },
      // Trigger when the top of the unit comes near the top 30% of the screen
      { rootMargin: '-20% 0px -80% 0px' } 
    );

    units.forEach((unit) => {
      const el = document.getElementById(`unit-${unit.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [units]);

  const handleSkillClick = (skill: Skill, unitColor: string) => {
    setSelectedSkill(skill);
    setSelectedSkillUnitColor(unitColor);
  };

  // Find the active skill (first unlocked but uncompleted skill)
  let activeSkillId: number | null = null;
  for (const unit of units) {
    for (const skill of unit.skills) {
      if (skill.is_unlocked && !skill.is_completed) {
        if (!activeSkillId) activeSkillId = skill.id;
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <TopBar />
          <div className={styles.loadingWrap}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`shimmer ${styles.skeletonCircle}`} style={{ marginLeft: `${PATH_OFFSETS[i] + 80}px` }} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        {/* Mobile Top Bar (hidden on desktop) */}
        <div className={styles.mobileTopBar}>
          <TopBar />
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.mainPath}>

          {/* SINGLE GLOBAL STICKY HEADER */}
          {activeHeaderUnit && (
            <div className={`${styles.unitHeader} ${styles.globalStickyHeader}`} style={{ background: activeHeaderUnit.color }}>
              <div className={styles.unitHeaderLeft}>
                <a className={styles.unitHeaderLink} href="/sections">
                  <img src="https://d35aaqx5ub95lt.cloudfront.net/images/path/icons/e013fd27fc6bd1d2fea85fe707b615cd.svg" alt="Back" width={18} height={18} className={styles.backIcon} />
                  <h1 className={styles.unitLabel}>SECTION {activeHeaderUnit.order}, UNIT {activeHeaderUnit.order}</h1>
                </a>
                <span className={styles.unitName}>{activeHeaderUnit.name}</span>
              </div>
              <div className={styles.unitRight}>
                <a className={styles.unitGuideBtn} href={`/guidebook/${activeHeaderUnit.id}`}>
                  <img src="https://d35aaqx5ub95lt.cloudfront.net/images/path/5b531828e59ae83aadb3d88e6b3a98a8.svg" alt="Guidebook" width={24} height={24} className={styles.guideIcon} />
                  <span className={styles.guideText}>GUIDEBOOK</span>
                </a>
              </div>
              {/* Decorative SVG Graphic */}
              <div className={styles.headerGraphic}>
                <svg viewBox="0 0 312 312" width="120" height="120">
                  <g transform="matrix(4,0,0,4,-130,-129)" opacity="1">
                    <path fill="rgba(255,255,255,0.15)" d=" M5.6519999504089355,-0.20800000429153442 C6.302000045776367,0.9120000004768372 5.9120001792907715,2.361999988555908 4.791999816894531,3.01200008392334 C4.791999816894531,3.01200008392334 0.21199999749660492,5.6519999504089355 0.21199999749660492,5.6519999504089355 C-0.9179999828338623,6.302000045776367 -2.3580000400543213,5.9120001792907715 -3.007999897003174,4.791999816894531 C-3.007999897003174,4.791999816894531 -5.6479997634887695,0.21199999749660492 -5.6479997634887695,0.21199999749660492 C-6.297999858856201,-0.9179999828338623 -5.918000221252441,-2.3580000400543213 -4.788000106811523,-3.007999897003174 C-4.788000106811523,-3.007999897003174 -0.20800000429153442,-5.6479997634887695 -0.20800000429153442,-5.6479997634887695 C0.9120000004768372,-6.297999858856201 2.361999988555908,-5.918000221252441 3.01200008392334,-4.788000106811523 C3.01200008392334,-4.788000106811523 5.6519999504089355,-0.20800000429153442 5.6519999504089355,-0.20800000429153442z" />
                  </g>
                </svg>
              </div>
            </div>
          )}

          {units.map((unit, unitIdx) => {
            let offsetCounter = 0;
            const midIndex = Math.floor(unit.skills.length / 2) - 1;

            return (
              <div id={`unit-${unit.id}`} key={unit.id} className={styles.unit}>

                {/* Section Divider */}
                <header className={styles.sectionDivider}>
                  <hr className={styles.dividerLine} />
                  <h2 className={styles.dividerText}>{unit.name}</h2>
                  <hr className={styles.dividerLine} />
                </header>

                {/* Skills path */}
                <div className={styles.skillsPath}>
                  {unit.skills.map((skill, index) => {
                    const offset = PATH_OFFSETS[offsetCounter++ % PATH_OFFSETS.length];
                    const isActiveSkill = skill.id === activeSkillId;
                    const isFutureUnit = activeSkillId && skill.id > activeSkillId;
                    const isJumpNode = index === 0 && unit.skills.every(s => !s.is_completed) && isFutureUnit;
                    const isSkillLocked = !skill.is_unlocked && !isJumpNode;
                    
                    // If node is shifted left (offset < 0), place character on the right empty space
                    const isRightSide = offset <= 0; 
                    const animationStyle: React.CSSProperties = {
                      position: 'absolute',
                      top: -60,
                      width: 220,
                      height: 220,
                      zIndex: 0,
                      pointerEvents: 'none',
                      ...(isRightSide ? { left: 'calc(100% + 10px)' } : { right: 'calc(100% + 10px)' })
                    };
                    
                    return (
                      <Fragment key={skill.id}>
                        <div
                          className={styles.skillNode}
                          style={{ 
                            marginLeft: `calc(50% + ${offset}px - 36px)`,
                            zIndex: selectedSkill?.id === skill.id ? 100 : (isActiveSkill || isJumpNode) ? 20 : 10
                          }}
                        >
                          {/* Lottie Character Decoration (Duo Twirl) */}
                          {unit.id === 1 && index === 1 && (
                            <div style={animationStyle}>
                              <Lottie animationData={duoTwirlData} loop={true} />
                            </div>
                          )}

                          {/* Lottie Character Decoration (Eddy Basketball) */}
                          {unit.id === 2 && index === 1 && (
                            <div style={animationStyle}>
                              <Lottie animationData={eddyBasketballData} loop={true} />
                            </div>
                          )}

                          {/* Lottie Character Decoration (Oscar Flower) */}
                          {unit.id === 3 && index === 1 && (
                            <div style={animationStyle}>
                              <Lottie animationData={oscarFlowerData} loop={true} />
                            </div>
                          )}

                          {/* Bouncing START badge for active skill (when no skill is selected) */}
                          {isActiveSkill && !selectedSkill && (
                            <div 
                              className={styles.floatingStart}
                              style={{ color: unit.color }}
                            >
                              START
                            </div>
                          )}

                          {/* JUMP HERE badge for future units */}
                          {isJumpNode && !selectedSkill && (
                            <div 
                              className={styles.floatingStart}
                              style={{ color: unit.color }}
                            >
                              JUMP HERE?
                            </div>
                          )}

                          <SkillBubble
                            skill={skill}
                            unitColor={unit.color}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkillClick(skill, unit.color);
                            }}
                            isJumpNode={isJumpNode as boolean}
                          />
                          {selectedSkill?.id === skill.id && (
                            <div className={styles.tooltipWrapper}>
                              <SkillModal
                                skill={selectedSkill}
                                unitColor={selectedSkillUnitColor}
                                onClose={() => setSelectedSkill(null)}
                                isLocked={isSkillLocked}
                              />
                            </div>
                          )}
                        </div>

                        {/* Mid-section Chest */}
                        {index === midIndex && (
                          <div 
                            className={styles.chestNode} 
                            style={{ 
                              marginLeft: `calc(50% + ${PATH_OFFSETS[offsetCounter++ % PATH_OFFSETS.length]}px - 36px)` 
                            }}
                          >
                            <img 
                              src={skill.is_completed 
                                ? "https://d35aaqx5ub95lt.cloudfront.net/images/path/8e1b4675455a4e453aac3681e0f5599e.svg" // Open
                                : "https://d35aaqx5ub95lt.cloudfront.net/images/path/b841637c196f5be786d8b8578a42ffbf.svg" // Closed
                              } 
                              alt="Chest" 
                              width={80} 
                              height={75} 
                            />
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>

          {/* Right sidebar – daily goal */}
          <div className={styles.rightSidebarWrapper}>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skill bubble ─────────────────────────────────────────────────────────────

function SkillBubble({ skill, unitColor, onClick, isJumpNode }: { skill: Skill; unitColor: string; onClick: (e: React.MouseEvent) => void; isJumpNode?: boolean }) {
  const progress = skill.total_lessons > 0
    ? (skill.completed_lessons / skill.total_lessons) * 100
    : 0;
  
  // A jump node is always colored and accessible, even if technically locked
  const locked = !skill.is_unlocked && !isJumpNode;
  const completed = skill.is_completed;

  let bgColor = unitColor;
  let shadowColor = unitColor;
  if (locked) {
    bgColor = '#e5e5e5';
    shadowColor = '#e5e5e5';
  } else if (completed) {
    bgColor = '#58CC02';
    shadowColor = '#45A301';
  }

  return (
    <div className={styles.bubbleWrap}>
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.skillBubble} ${locked ? styles.locked : ''} ${completed ? styles.completed : ''}`}
          style={{ background: bgColor, '--button-shadow-color': shadowColor } as React.CSSProperties}
          onClick={onClick}
          title={skill.name}
        >
          {completed ? (
            /* Completed: Check icon and glossy shine overlay */
            <>
              <Image src="/icons/skill-complete-check.svg" alt="completed" width={42} height={34} className={styles.completedCheck} />
              <Image src="/icons/skill-shine.svg" alt="" width={56} height={46} className={styles.shineOverlay} />
            </>
          ) : locked ? (
            /* Locked: grey padlock icon */
            <Image src="/icons/skill-locked.svg" alt="locked" width={42} height={34} />
          ) : (
            /* Active: white star (skill-specific emoji falls back to star) */
            <Image src="/icons/skill-star.svg" alt={skill.name} width={42} height={34} className={styles.starIcon} />
          )}
        </button>

        {/* Progress ring outside the button */}
        {!locked && !completed && progress > 0 && (
          <svg className={styles.progressRing} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#e5e5e5" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke={unitColor}
              strokeWidth="8"
              pathLength="100"
              strokeDasharray={`${progress} 100`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
