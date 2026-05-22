export interface CountSleepEvent {
  id: string;
  name: string;
  emoji: string;
  targetDate: string;
}

export interface CountSleepEventInput {
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

export function normalizeAppState(value: unknown): AppState {
  if (!isRecord(value) || !Array.isArray(value.events)) {
    return createInitialAppState();
  }

  return {
    events: value.events.filter(isCountSleepEvent),
  };
}

export function addEvent(state: AppState, input: CountSleepEventInput, id: string): AppState {
  const event = createEvent(input, id);
  return {
    ...state,
    events: [...state.events, event],
  };
}

export function updateEvent(state: AppState, id: string, input: CountSleepEventInput): AppState {
  return {
    ...state,
    events: state.events.map((event) => (event.id === id ? createEvent(input, id) : event)),
  };
}

export function removeEvent(state: AppState, id: string): AppState {
  return {
    ...state,
    events: state.events.filter((event) => event.id !== id),
  };
}

export function findEvent(state: AppState, id: string): CountSleepEvent | null {
  return state.events.find((event) => event.id === id) ?? null;
}

function createEvent(input: CountSleepEventInput, id: string): CountSleepEvent {
  return {
    id,
    name: input.name.trim(),
    emoji: input.emoji.trim() || "📅",
    targetDate: input.targetDate,
  };
}

function isCountSleepEvent(value: unknown): value is CountSleepEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.emoji === "string" &&
    typeof value.targetDate === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
