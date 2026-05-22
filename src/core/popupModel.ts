import { createInitialAppState, type AppState, type CountSleepEvent } from "./appState";
import { calculateSleepsUntil } from "./sleeps";

export interface EventSummary {
  id: string;
  name: string;
  emoji: string;
  targetDate: string;
  sleeps: number | null;
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
  const events = state.events
    .map((event, index) => ({ event: createEventSummary(event, today), index }))
    .sort(compareEventSummaryEntries)
    .map((entry) => entry.event);

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
    sleeps,
    sleepsLabel: createSleepsLabel(sleeps, status),
    status,
    statusLabel: createStatusLabel(status),
  };
}

function compareEventSummaryEntries(
  left: { event: EventSummary; index: number },
  right: { event: EventSummary; index: number },
): number {
  return (
    getSortRank(left.event) - getSortRank(right.event) ||
    compareSleeps(left.event, right.event) ||
    left.event.targetDate.localeCompare(right.event.targetDate) ||
    left.index - right.index
  );
}

function getSortRank(event: EventSummary): number {
  switch (event.status) {
    case "today":
      return 0;
    case "upcoming":
      return 1;
    case "past":
      return 2;
    case "unknown":
      return 3;
  }
}

function compareSleeps(left: EventSummary, right: EventSummary): number {
  if (left.sleeps === null || right.sleeps === null) {
    return 0;
  }

  if (left.status === "past" && right.status === "past") {
    return right.sleeps - left.sleeps;
  }

  return left.sleeps - right.sleeps;
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
