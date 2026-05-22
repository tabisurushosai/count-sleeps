import { createInitialPopupModel, type EventSummary, type PopupModel } from "./core/popupModel";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("#app is missing");
}

const model = createInitialPopupModel();

function renderPopup(root: HTMLElement, popupModel: PopupModel): void {
  root.replaceChildren();
  root.append(
    createStyle(),
    createHeader(popupModel.title),
    createFeatured(popupModel.featuredEvent),
    createEventList(popupModel.events),
  );
}

function createStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = `
    :root {
      color: #202124;
      background: #fffaf2;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body {
      width: 320px;
      margin: 0;
      padding: 14px;
      box-sizing: border-box;
      background: #fffaf2;
    }

    #app,
    .app-shell {
      display: grid;
      gap: 12px;
    }

    .app-title {
      margin: 0;
      font-size: 18px;
      line-height: 1.3;
      font-weight: 700;
    }

    .featured {
      display: grid;
      gap: 8px;
      padding: 14px;
      border: 2px solid #ffd58a;
      border-radius: 8px;
      background: #fff;
    }

    .featured__label {
      margin: 0;
      color: #5f6368;
      font-size: 12px;
    }

    .featured__count {
      margin: 0;
      font-size: 44px;
      line-height: 1;
      font-weight: 800;
      color: #d65f00;
    }

    .featured__name {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
    }

    .section-title {
      margin: 2px 0 0;
      font-size: 13px;
      color: #5f6368;
      font-weight: 700;
    }

    .event-list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .event-item,
    .empty-state {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 8px;
      align-items: center;
      min-height: 44px;
      padding: 10px;
      border: 1px solid #eadcc4;
      border-radius: 8px;
      background: #fff;
    }

    .event-item__emoji {
      font-size: 22px;
      line-height: 1;
    }

    .event-item__name {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }

    .event-item__date {
      margin: 2px 0 0;
      color: #5f6368;
      font-size: 12px;
    }

    .event-item__sleeps {
      font-size: 13px;
      font-weight: 700;
      color: #d65f00;
      white-space: nowrap;
    }

    .empty-state {
      grid-template-columns: 1fr;
      color: #5f6368;
      font-size: 13px;
      line-height: 1.5;
    }
  `;
  return style;
}

function createHeader(title: string): HTMLElement {
  const shell = document.createElement("section");
  shell.className = "app-shell";

  const heading = document.createElement("h1");
  heading.className = "app-title";
  heading.textContent = title;

  shell.append(heading);
  return shell;
}

function createFeatured(event: EventSummary | null): HTMLElement {
  const section = document.createElement("section");
  section.className = "featured";

  const label = document.createElement("p");
  label.className = "featured__label";
  label.textContent = "いちばん近い予定";

  const count = document.createElement("p");
  count.className = "featured__count";
  count.textContent = event ? event.sleepsLabel : "-- ねる";

  const name = document.createElement("p");
  name.className = "featured__name";
  name.textContent = event ? `${event.emoji} ${event.name}` : "予定を追加すると、ここに大きく表示されます";

  section.append(label, count, name);
  return section;
}

function createEventList(events: EventSummary[]): HTMLElement {
  const section = document.createElement("section");

  const heading = document.createElement("h2");
  heading.className = "section-title";
  heading.textContent = "イベント一覧";

  const list = document.createElement("ul");
  list.className = "event-list";

  if (events.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "まだイベントがありません";
    list.append(empty);
  } else {
    list.append(...events.map(createEventItem));
  }

  section.append(heading, list);
  return section;
}

function createEventItem(event: EventSummary): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "event-item";

  const emoji = document.createElement("span");
  emoji.className = "event-item__emoji";
  emoji.textContent = event.emoji;

  const detail = document.createElement("div");

  const name = document.createElement("p");
  name.className = "event-item__name";
  name.textContent = event.name;

  const date = document.createElement("p");
  date.className = "event-item__date";
  date.textContent = event.targetDate;

  const sleeps = document.createElement("span");
  sleeps.className = "event-item__sleeps";
  sleeps.textContent = event.sleepsLabel;

  detail.append(name, date);
  item.append(emoji, detail, sleeps);
  return item;
}

renderPopup(app, model);
