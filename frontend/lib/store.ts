'use client';
import { create } from 'zustand';
import { User } from './api';

interface AppState {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  currentLessonId: number | null;
  currentSkillId: number | null;
  setCurrentLesson: (lessonId: number, skillId: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
  currentLessonId: null,
  currentSkillId: null,
  setCurrentLesson: (lessonId, skillId) =>
    set({ currentLessonId: lessonId, currentSkillId: skillId }),
}));
