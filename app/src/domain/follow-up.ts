export type FollowUpBucket =
  | "OVERDUE"
  | "TODAY"
  | "UPCOMING"
  | "COMPLETED";

function dateKey(
  value: Date,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(value);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function classifyFollowUp(
  status: "PENDING" | "COMPLETED",
  dueAt: Date,
  now: Date,
  timeZone: string,
): FollowUpBucket {
  if (status === "COMPLETED") {
    return "COMPLETED";
  }

  const dueKey = dateKey(dueAt, timeZone);
  const nowKey = dateKey(now, timeZone);

  if (dueKey < nowKey) {
    return "OVERDUE";
  }

  if (dueKey === nowKey) {
    return "TODAY";
  }

  return "UPCOMING";
}
