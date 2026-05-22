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

export interface PopupModelLabels {
  title: string;
  todayStatus: string;
  pastStatus: string;
  unknownStatus: string;
  upcomingStatus: string;
  todaySleeps: string;
  pastSleeps: string;
  unknownSleeps: string;
  sleepsCount: (sleeps: number) => string;
}

export function createPopupModel(
  state: AppState,
  labels: PopupModelLabels,
  today: Date = new Date(),
): PopupModel {
  const events = state.events
    .map((event, index) => ({ event: createEventSummary(event, labels, today), index }))
    .sort(compareEventSummaryEntries)
    .map((entry) => entry.event);

  return {
    title: labels.title,
    featuredEvent: events[0] ?? null,
    events,
  };
}

export function createInitialPopupModel(labels: PopupModelLabels): PopupModel {
  return createPopupModel(createInitialAppState(), labels);
}

function createEventSummary(event: CountSleepEvent, labels: PopupModelLabels, today: Date): EventSummary {
  const sleeps = calculateSleepsUntil(event.targetDate, today);
  const status = createEventStatus(sleeps);

  return {
    id: event.id,
    name: event.name,
    emoji: event.emoji,
    targetDate: event.targetDate,
    sleeps,
    sleepsLabel: createSleepsLabel(sleeps, status, labels),
    status,
    statusLabel: createStatusLabel(status, labels),
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

function createSleepsLabel(
  sleeps: number | null,
  status: EventStatus,
  labels: PopupModelLabels,
): string {
  if (status === "today") {
    return labels.todaySleeps;
  }

  if (status === "past") {
    return labels.pastSleeps;
  }

  return sleeps === null ? labels.unknownSleeps : labels.sleepsCount(sleeps);
}

function createStatusLabel(status: EventStatus, labels: PopupModelLabels): string {
  switch (status) {
    case "today":
      return labels.todayStatus;
    case "past":
      return labels.pastStatus;
    case "unknown":
      return labels.unknownStatus;
    case "upcoming":
      return labels.upcomingStatus;
  }
}
