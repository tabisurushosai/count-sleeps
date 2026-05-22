import { createInitialAppState, type AppState, type CountSleepEvent } from "./appState";
import { calculateSleepsUntil } from "./sleeps";

export interface EventSummary {
  id: string;
  name: string;
  emoji: string;
  targetDate: string;
  sleepsLabel: string;
  status: EventStatus;
  statusLabel: string;
}

export type EventStatus = "upcoming" | "today" | "past" | "unknown";

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
  const status = createEventStatus(sleeps);

  return {
    id: event.id,
    name: event.name,
    emoji: event.emoji,
    targetDate: event.targetDate,
    sleepsLabel: createSleepsLabel(sleeps, status),
    status,
    statusLabel: createStatusLabel(status),
  };
}

function createEventStatus(sleeps: number | null): EventStatus {
  if (sleeps === null) {
    return "unknown";
  }

  if (sleeps === 0) {
    return "today";
  }

  return sleeps < 0 ? "past" : "upcoming";
}

function createSleepsLabel(sleeps: number | null, status: EventStatus): string {
  if (status === "today") {
    return "きょうだよ!";
  }

  if (status === "past") {
    return "完了";
  }

  return sleeps === null ? "-- ねる" : `${sleeps} ねる`;
}

function createStatusLabel(status: EventStatus): string {
  switch (status) {
    case "today":
      return "きょう";
    case "past":
      return "完了";
    case "unknown":
      return "日付未確認";
    case "upcoming":
      return "これから";
  }
}
