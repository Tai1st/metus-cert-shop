'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { vi } from '@/messages/vi';
import { en } from '@/messages/en';

export type Locale = 'vi' | 'en';

const MESSAGES = { vi, en };
const STORAGE_KEY = 'metus-cert-shop:locale';

type Vars = Record<string, string | number>;

function get(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function interpolate(str: string, vars?: Vars) {
  if (!vars) return str;
  let out = str;
  for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Vars) => string;
  /** true khi đã đọc xong lựa chọn đã lưu (hoặc xác nhận chưa có) từ localStorage */
  ready: boolean;
  /** true nếu khách đã từng chọn ngôn ngữ (dùng để quyết định có hiện màn chọn lần đầu không) */
  chosen: boolean;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');
  const [chosen, setChosen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') {
        setLocaleState(saved);
        setChosen(true);
      }
    } catch {
      /* localStorage có thể bị chặn (chế độ riêng tư...): mặc định tiếng Việt, vẫn hỏi lại mỗi lần */
    }
    setReady(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    setChosen(true);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* bỏ qua, chỉ ảnh hưởng tới việc nhớ lựa chọn cho lần sau */
    }
  };

  const t = (key: string, vars?: Vars) => {
    const str = (get(MESSAGES[locale], key) as string | undefined) ?? (get(MESSAGES.vi, key) as string | undefined) ?? key;
    return interpolate(str, vars);
  };

  return <I18nContext.Provider value={{ locale, setLocale, t, ready, chosen }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n phải nằm trong I18nProvider');
  return ctx;
}
