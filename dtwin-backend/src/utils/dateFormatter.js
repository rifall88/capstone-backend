export const formatDateForFE = (dateInput) => {
  if (!dateInput) return null;

  const date = new Date(dateInput);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(date);
  let day, month, year, hour, minute, ampm;

  parts.forEach(({ type, value }) => {
    if (type === "day") day = value;
    if (type === "month") month = value;
    if (type === "year") year = value;
    if (type === "hour") hour = value;
    if (type === "minute") minute = value;
    if (type === "dayPeriod") ampm = value.toLowerCase();
  });

  return `${day} ${month} ${year}, ${hour}.${minute} ${ampm}`;
};
