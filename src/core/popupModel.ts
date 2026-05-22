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

export function createInitialPopupModel(): PopupModel {
  return {
    title: "あとなんねる",
    featuredEvent: null,
    events: [],
  };
}
