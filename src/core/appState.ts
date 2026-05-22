export interface CountSleepEvent {
  id: string;
  name: string;
  emoji: string;
  targetDate: string;
}

export interface AppState {
  events: CountSleepEvent[];
}

export function createInitialAppState(): AppState {
  return {
    events: [],
  };
}
