import { createInitialAppState, type AppState, type CountSleepEvent } from "./appState";

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

export function createPopupModel(state: AppState): PopupModel {
  const events = state.events.map(createEventSummary);

  return {
    title: "あとなんねる",
    featuredEvent: events[0] ?? null,
    events,
  };
}

export function createInitialPopupModel(): PopupModel {
  return createPopupModel(createInitialAppState());
}

function createEventSummary(event: CountSleepEvent): EventSummary {
  return {
    id: event.id,
    name: event.name,
    emoji: event.emoji,
    targetDate: event.targetDate,
    sleepsLabel: "-- ねる",
  };
}
