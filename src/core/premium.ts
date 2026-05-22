import type { AppState, BackgroundTheme } from "./appState";

export const FREE_EVENT_LIMIT = 3;
export const PREMIUM_TRIAL_DAYS = 7;
export const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/";

export interface PremiumAccess {
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  canStartTrial: boolean;
  canAddEvent: boolean;
  eventLimit: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function createPremiumAccess(state: AppState, today: Date = new Date()): PremiumAccess {
  const isTrialActive = isPremiumTrialActive(state, today);
  const isPremium = state.premium.purchased || isTrialActive;

  return {
    isPremium,
    isTrialActive,
    trialDaysRemaining: getTrialDaysRemaining(state, today),
    canStartTrial: !state.premium.purchased && state.premium.trialStartedAt === null,
    canAddEvent: isPremium || state.events.length < FREE_EVENT_LIMIT,
    eventLimit: FREE_EVENT_LIMIT,
  };
}

export function startPremiumTrial(state: AppState, today: Date = new Date()): AppState {
  if (state.premium.purchased || state.premium.trialStartedAt !== null) {
    return state;
  }

  return {
    ...state,
    premium: {
      ...state.premium,
      trialStartedAt: toDateKey(today),
    },
  };
}

export function activatePremiumPurchase(state: AppState): AppState {
  return {
    ...state,
    premium: {
      ...state.premium,
      purchased: true,
    },
  };
}

export function setBackgroundTheme(
  state: AppState,
  theme: BackgroundTheme,
  today: Date = new Date(),
): AppState {
  if (!createPremiumAccess(state, today).isPremium) {
    return {
      ...state,
      backgroundTheme: "sunrise",
    };
  }

  return {
    ...state,
    backgroundTheme: theme,
  };
}

function isPremiumTrialActive(state: AppState, today: Date): boolean {
  return getTrialDaysRemaining(state, today) > 0;
}

function getTrialDaysRemaining(state: AppState, today: Date): number {
  if (state.premium.trialStartedAt === null) {
    return 0;
  }

  const startedAt = parseDateKey(state.premium.trialStartedAt);
  if (startedAt === null) {
    return 0;
  }

  const elapsedDays = Math.floor((startOfDay(today).getTime() - startedAt.getTime()) / DAY_MS);
  return Math.max(0, PREMIUM_TRIAL_DAYS - elapsedDays);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
