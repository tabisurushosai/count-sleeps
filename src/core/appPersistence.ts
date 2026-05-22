import { normalizeAppState, type AppState } from "./appState";

export const APP_STATE_STORAGE_KEY = "countSleeps.appState.v1";

export interface AppStateStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export async function loadAppState(store: AppStateStore): Promise<AppState> {
  const savedState = await store.get<unknown>(APP_STATE_STORAGE_KEY);
  return normalizeAppState(savedState);
}

export function saveAppState(store: AppStateStore, state: AppState): Promise<void> {
  return store.set(APP_STATE_STORAGE_KEY, state);
}
