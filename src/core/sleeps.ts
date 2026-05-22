const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateSleepsUntil(targetDate: string, today: Date = new Date()): number | null {
  const targetDay = parseDateInputDay(targetDate);

  if (targetDay === null) {
    return null;
  }

  return targetDay - toLocalDayNumber(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

function parseDateInputDay(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return toLocalDayNumber(year, month, day);
}

function toLocalDayNumber(year: number, month: number, day: number): number {
  return Math.floor(new Date(year, month - 1, day).getTime() / MS_PER_DAY);
}
