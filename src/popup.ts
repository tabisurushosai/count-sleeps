import {
  addEvent,
  createInitialAppState,
  findEvent,
  removeEvent,
  updateEvent,
  type AppState,
  type BackgroundTheme,
  type CountSleepEventInput,
} from "./core/appState";
import { loadAppState, saveAppState } from "./core/appPersistence";
import {
  STRIPE_CHECKOUT_URL,
  createPremiumAccess,
  setBackgroundTheme,
  startPremiumTrial,
} from "./core/premium";
import {
  createPopupModel,
  type EventSummary,
  type PopupModel,
  type PopupModelLabels,
} from "./core/popupModel";
import { store } from "./storage";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("#app is missing");
}

const root = app;

interface UiState {
  editingEventId: string | null;
}

interface UiMessages {
  popupModel: PopupModelLabels;
  emojiLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  dateLabel: string;
  cancelButton: string;
  updateButton: string;
  addButton: string;
  featuredFallbackLabel: string;
  featuredFallbackName: string;
  eventsHeading: string;
  emptyEvents: string;
  editButton: string;
  deleteButton: string;
  premiumHeading: string;
  premiumFreeStatus: string;
  premiumTrialStatus: (days: number) => string;
  premiumPurchasedStatus: string;
  premiumLimitNotice: (limit: number) => string;
  premiumStartTrialButton: string;
  premiumCheckoutButton: string;
  themeLabel: string;
  themeLocked: string;
  themeSunrise: string;
  themeSky: string;
  themeForest: string;
}

const uiMessages = createUiMessages();

let appState: AppState = createInitialAppState();
let uiState: UiState = {
  editingEventId: null,
};

document.title = uiMessages.popupModel.title;

function renderPopup(root: HTMLElement, popupModel: PopupModel, currentUiState: UiState): void {
  root.replaceChildren();
  root.append(
    createStyle(),
    createHeader(popupModel.title),
    createPremiumPanel(appState),
    createEventForm(appState, currentUiState),
    createFeatured(popupModel.featuredEvent),
    createEventList(popupModel.events),
  );
}

function createUiMessages(): UiMessages {
  return {
    popupModel: {
      title: message("extName"),
      todayStatus: message("statusToday"),
      pastStatus: message("statusPast"),
      unknownStatus: message("statusUnknown"),
      upcomingStatus: message("statusUpcoming"),
      todaySleeps: message("sleepsToday"),
      pastSleeps: message("sleepsPast"),
      unknownSleeps: message("sleepsUnknown"),
      sleepsCount: (sleeps) => message("sleepsCount", String(sleeps)),
    },
    emojiLabel: message("emojiLabel"),
    nameLabel: message("nameLabel"),
    namePlaceholder: message("namePlaceholder"),
    dateLabel: message("dateLabel"),
    cancelButton: message("cancelButton"),
    updateButton: message("updateButton"),
    addButton: message("addButton"),
    featuredFallbackLabel: message("featuredFallbackLabel"),
    featuredFallbackName: message("featuredFallbackName"),
    eventsHeading: message("eventsHeading"),
    emptyEvents: message("emptyEvents"),
    editButton: message("editButton"),
    deleteButton: message("deleteButton"),
    premiumHeading: message("premiumHeading"),
    premiumFreeStatus: message("premiumFreeStatus"),
    premiumTrialStatus: (days) => message("premiumTrialStatus", String(days)),
    premiumPurchasedStatus: message("premiumPurchasedStatus"),
    premiumLimitNotice: (limit) => message("premiumLimitNotice", String(limit)),
    premiumStartTrialButton: message("premiumStartTrialButton"),
    premiumCheckoutButton: message("premiumCheckoutButton"),
    themeLabel: message("themeLabel"),
    themeLocked: message("themeLocked"),
    themeSunrise: message("themeSunrise"),
    themeSky: message("themeSky"),
    themeForest: message("themeForest"),
  };
}

function message(name: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(name, substitutions) || name;
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
      background: var(--app-bg, #fffaf2);
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

    .theme-sunrise {
      --app-bg: #fffaf2;
      --featured-bg: #fff;
      --accent: #d65f00;
      --accent-soft: #ffd58a;
    }

    .theme-sky {
      --app-bg: #eef7ff;
      --featured-bg: #ffffff;
      --accent: #1769aa;
      --accent-soft: #a9d8ff;
    }

    .theme-forest {
      --app-bg: #f2fbf4;
      --featured-bg: #ffffff;
      --accent: #2f7d4f;
      --accent-soft: #aadfbd;
    }

    .premium-panel {
      display: grid;
      gap: 8px;
      padding: 10px;
      border: 1px solid #eadcc4;
      border-radius: 8px;
      background: #fff;
    }

    .premium-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .premium-panel__title {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
    }

    .premium-panel__status,
    .premium-panel__notice {
      margin: 0;
      color: #5f6368;
      font-size: 12px;
      line-height: 1.4;
    }

    .premium-panel__actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .premium-panel__link {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 0 10px;
      border: 1px solid #d8c7ab;
      border-radius: 6px;
      color: #202124;
      background: #fff7e8;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
    }

    .theme-control {
      display: grid;
      gap: 4px;
      color: #5f6368;
      font-size: 12px;
      font-weight: 700;
    }

    .theme-control__select {
      min-height: 32px;
      border: 1px solid #d8c7ab;
      border-radius: 6px;
      background: #fff;
      color: #202124;
      font: inherit;
      font-size: 13px;
    }

    .featured--today {
      border-color: var(--accent, #d65f00);
      background: #fff3dc;
      animation: today-pop 900ms ease-in-out both;
    }

    .featured--past {
      border-color: #c9d7c5;
      background: #f7fbf4;
    }

    .event-form {
      display: grid;
      gap: 8px;
      padding: 12px;
      border: 1px solid #eadcc4;
      border-radius: 8px;
      background: #fff;
    }

    .event-form__row {
      display: grid;
      grid-template-columns: 56px 1fr;
      gap: 8px;
    }

    .event-form__label {
      display: grid;
      gap: 4px;
      color: #5f6368;
      font-size: 12px;
      font-weight: 700;
    }

    .event-form__input {
      box-sizing: border-box;
      width: 100%;
      min-height: 34px;
      padding: 7px 8px;
      border: 1px solid #d8c7ab;
      border-radius: 6px;
      color: #202124;
      background: #fff;
      font: inherit;
      font-size: 13px;
    }

    .event-form__actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .button {
      min-height: 32px;
      padding: 0 10px;
      border: 1px solid #d8c7ab;
      border-radius: 6px;
      color: #202124;
      background: #fff7e8;
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .button--primary {
      border-color: var(--accent, #d65f00);
      color: #fff;
      background: var(--accent, #d65f00);
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
      color: var(--accent, #d65f00);
    }

    .featured--today .featured__count {
      color: #b94700;
    }

    .featured--past .featured__count {
      color: #3d7a43;
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
      grid-template-columns: auto 1fr auto auto;
      gap: 8px;
      align-items: center;
      min-height: 44px;
      padding: 10px;
      border: 1px solid #eadcc4;
      border-radius: 8px;
      background: #fff;
    }

    .event-item--today {
      border-color: var(--accent, #d65f00);
      background: #fff8ec;
    }

    .event-item--past {
      border-color: #c9d7c5;
      background: #f7fbf4;
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
      color: var(--accent, #d65f00);
      white-space: nowrap;
    }

    .event-item--past .event-item__sleeps {
      color: #3d7a43;
    }

    .event-item__actions {
      display: flex;
      gap: 4px;
    }

    .event-item__button {
      min-width: 36px;
      min-height: 28px;
      padding: 0 7px;
      border: 1px solid #d8c7ab;
      border-radius: 6px;
      background: #fff7e8;
      color: #202124;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .empty-state {
      grid-template-columns: 1fr;
      color: #5f6368;
      font-size: 13px;
      line-height: 1.5;
    }

    @keyframes today-pop {
      0% {
        transform: scale(0.98);
      }
      55% {
        transform: scale(1.02);
      }
      100% {
        transform: scale(1);
      }
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

function createPremiumPanel(state: AppState): HTMLElement {
  const access = createPremiumAccess(state);
  const panel = document.createElement("section");
  panel.className = "premium-panel";

  const header = document.createElement("div");
  header.className = "premium-panel__header";

  const heading = document.createElement("h2");
  heading.className = "premium-panel__title";
  heading.textContent = uiMessages.premiumHeading;

  const status = document.createElement("p");
  status.className = "premium-panel__status";
  status.textContent = state.premium.purchased
    ? uiMessages.premiumPurchasedStatus
    : access.isTrialActive
      ? uiMessages.premiumTrialStatus(access.trialDaysRemaining)
      : uiMessages.premiumFreeStatus;

  header.append(heading, status);
  panel.append(header);

  if (!access.canAddEvent) {
    const notice = document.createElement("p");
    notice.className = "premium-panel__notice";
    notice.textContent = uiMessages.premiumLimitNotice(access.eventLimit);
    panel.append(notice);
  }

  const actions = document.createElement("div");
  actions.className = "premium-panel__actions";

  if (access.canStartTrial) {
    const trialButton = document.createElement("button");
    trialButton.className = "button";
    trialButton.type = "button";
    trialButton.textContent = uiMessages.premiumStartTrialButton;
    trialButton.addEventListener("click", () => {
      void startTrial();
    });
    actions.append(trialButton);
  }

  const checkoutLink = document.createElement("a");
  checkoutLink.className = "premium-panel__link";
  checkoutLink.href = STRIPE_CHECKOUT_URL;
  checkoutLink.target = "_blank";
  checkoutLink.rel = "noreferrer";
  checkoutLink.textContent = uiMessages.premiumCheckoutButton;
  actions.append(checkoutLink);

  panel.append(actions, createThemeControl(state, access.isPremium));
  return panel;
}

function createThemeControl(state: AppState, isPremium: boolean): HTMLElement {
  const label = document.createElement("label");
  label.className = "theme-control";
  label.textContent = uiMessages.themeLabel;

  const select = document.createElement("select");
  select.className = "theme-control__select";
  select.name = "backgroundTheme";
  select.disabled = !isPremium;

  const themes: Array<{ value: BackgroundTheme; label: string }> = [
    { value: "sunrise", label: uiMessages.themeSunrise },
    { value: "sky", label: uiMessages.themeSky },
    { value: "forest", label: uiMessages.themeForest },
  ];

  select.append(...themes.map(createThemeOption));
  select.value = isPremium ? state.backgroundTheme : "sunrise";
  select.addEventListener("change", () => {
    void changeTheme(select.value as BackgroundTheme);
  });

  label.append(select);

  if (!isPremium) {
    const locked = document.createElement("span");
    locked.className = "premium-panel__notice";
    locked.textContent = uiMessages.themeLocked;
    label.append(locked);
  }

  return label;
}

function createThemeOption(theme: { value: BackgroundTheme; label: string }): HTMLOptionElement {
  const option = document.createElement("option");
  option.value = theme.value;
  option.textContent = theme.label;
  return option;
}

function createEventForm(state: AppState, currentUiState: UiState): HTMLElement {
  const editingEvent = currentUiState.editingEventId ? findEvent(state, currentUiState.editingEventId) : null;
  const access = createPremiumAccess(state);
  const form = document.createElement("form");
  form.className = "event-form";

  const row = document.createElement("div");
  row.className = "event-form__row";

  const emojiLabel = createFormLabel(uiMessages.emojiLabel);
  const emojiInput = createInput("text", "emoji", "📅");
  emojiInput.maxLength = 4;
  emojiInput.value = editingEvent?.emoji ?? "";
  emojiLabel.append(emojiInput);

  const nameLabel = createFormLabel(uiMessages.nameLabel);
  const nameInput = createInput("text", "name", uiMessages.namePlaceholder);
  nameInput.required = true;
  nameInput.value = editingEvent?.name ?? "";
  nameLabel.append(nameInput);

  row.append(emojiLabel, nameLabel);

  const dateLabel = createFormLabel(uiMessages.dateLabel);
  const dateInput = createInput("date", "targetDate", "");
  dateInput.required = true;
  dateInput.value = editingEvent?.targetDate ?? "";
  dateLabel.append(dateInput);

  const actions = document.createElement("div");
  actions.className = "event-form__actions";

  if (editingEvent) {
    const cancelButton = document.createElement("button");
    cancelButton.className = "button";
    cancelButton.type = "button";
    cancelButton.textContent = uiMessages.cancelButton;
    cancelButton.addEventListener("click", () => {
      uiState = { editingEventId: null };
      render();
    });
    actions.append(cancelButton);
  }

  const submitButton = document.createElement("button");
  submitButton.className = "button button--primary";
  submitButton.type = "submit";
  submitButton.textContent = editingEvent ? uiMessages.updateButton : uiMessages.addButton;
  submitButton.disabled = !editingEvent && !access.canAddEvent;
  actions.append(submitButton);

  form.append(row, dateLabel, actions);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveForm(form, currentUiState.editingEventId);
  });

  return form;
}

function createFormLabel(text: string): HTMLLabelElement {
  const label = document.createElement("label");
  label.className = "event-form__label";
  label.textContent = text;
  return label;
}

function createInput(type: string, name: string, placeholder: string): HTMLInputElement {
  const input = document.createElement("input");
  input.className = "event-form__input";
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;
  return input;
}

function createFeatured(event: EventSummary | null): HTMLElement {
  const section = document.createElement("section");
  section.className = "featured";
  if (event?.status === "today" || event?.status === "past") {
    section.classList.add(`featured--${event.status}`);
  }

  const label = document.createElement("p");
  label.className = "featured__label";
  label.textContent = event ? event.statusLabel : uiMessages.featuredFallbackLabel;

  const count = document.createElement("p");
  count.className = "featured__count";
  count.textContent = event ? event.sleepsLabel : uiMessages.popupModel.unknownSleeps;

  const name = document.createElement("p");
  name.className = "featured__name";
  name.textContent = event ? `${event.emoji} ${event.name}` : uiMessages.featuredFallbackName;

  section.append(label, count, name);
  return section;
}

function createEventList(events: EventSummary[]): HTMLElement {
  const section = document.createElement("section");

  const heading = document.createElement("h2");
  heading.className = "section-title";
  heading.textContent = uiMessages.eventsHeading;

  const list = document.createElement("ul");
  list.className = "event-list";

  if (events.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = uiMessages.emptyEvents;
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
  if (event.status === "today" || event.status === "past") {
    item.classList.add(`event-item--${event.status}`);
  }

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

  const actions = document.createElement("div");
  actions.className = "event-item__actions";

  const editButton = document.createElement("button");
  editButton.className = "event-item__button";
  editButton.type = "button";
  editButton.textContent = uiMessages.editButton;
  editButton.addEventListener("click", () => {
    uiState = { editingEventId: event.id };
    render();
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "event-item__button";
  deleteButton.type = "button";
  deleteButton.textContent = uiMessages.deleteButton;
  deleteButton.addEventListener("click", () => {
    void deleteEvent(event.id);
  });

  actions.append(editButton, deleteButton);
  detail.append(name, date);
  item.append(emoji, detail, sleeps, actions);
  return item;
}

function readFormInput(form: HTMLFormElement): CountSleepEventInput {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") ?? ""),
    emoji: String(formData.get("emoji") ?? ""),
    targetDate: String(formData.get("targetDate") ?? ""),
  };
}

async function saveForm(form: HTMLFormElement, editingEventId: string | null): Promise<void> {
  if (!editingEventId && !createPremiumAccess(appState).canAddEvent) {
    render();
    return;
  }

  const input = readFormInput(form);
  appState = editingEventId
    ? updateEvent(appState, editingEventId, input)
    : addEvent(appState, input, createEventId());
  uiState = { editingEventId: null };
  await saveAppState(store, appState);
  render();
}

async function startTrial(): Promise<void> {
  appState = startPremiumTrial(appState);
  await saveAppState(store, appState);
  render();
}

async function changeTheme(theme: BackgroundTheme): Promise<void> {
  appState = setBackgroundTheme(appState, theme);
  await saveAppState(store, appState);
  render();
}

async function deleteEvent(id: string): Promise<void> {
  appState = removeEvent(appState, id);
  uiState = { editingEventId: uiState.editingEventId === id ? null : uiState.editingEventId };
  await saveAppState(store, appState);
  render();
}

function createEventId(): string {
  return crypto.randomUUID();
}

function render(): void {
  document.body.className = createPremiumAccess(appState).isPremium
    ? `theme-${appState.backgroundTheme}`
    : "theme-sunrise";
  renderPopup(root, createPopupModel(appState, uiMessages.popupModel), uiState);
}

async function start(): Promise<void> {
  appState = await loadAppState(store);
  render();
}

void start();
