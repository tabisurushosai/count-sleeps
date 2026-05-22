import { createInitialAppState, type AppState, type CountSleepEvent } from "./appState";
import { calculateSleepsUntil } from "./sleeps";

export interface EventSummary {
  id: string;
  name: string;
  emoji: string;
  targetDate: string;
  sleepsLabel: string;
}

export interface PopupModel {
  title: string;
  featuredEvent: EventSummary | null;
  events: EventSummary[];
}

export function createPopupModel(state: AppState, today: Date = new Date()): PopupModel {
  const events = state.events.map((event) => createEventSummary(event, today));

  return {
    title: "あとなんねる",
    featuredEvent: events[0] ?? null,
    events,
  };
}

export function createInitialPopupModel(): PopupModel {
  return createPopupModel(createInitialAppState());
}

function createEventSummary(event: CountSleepEvent, today: Date): EventSummary {
  const sleeps = calculateSleepsUntil(event.targetDate, today);

  return {
    id: event.id,
    name: event.name,
    emoji: event.emoji,
    targetDate: event.targetDate,
    sleepsLabel: sleeps === null ? "-- ねる" : `${sleeps} ねる`,
  };
}
