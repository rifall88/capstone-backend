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

export const parseUserAgent = (userAgent) => {
  if (!userAgent) return "Unknown / Unknown";

  let browser = "Unknown";
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg"))
    browser = "Chrome";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
    browser = "Safari";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.toLowerCase().includes("postman")) browser = "Postman";
  else if (
    userAgent.toLowerCase().includes("python") ||
    userAgent.toLowerCase().includes("axios")
  )
    browser = "API/Script";

  let os = "Unknown";
  if (userAgent.includes("Windows NT 10.0") || userAgent.includes("Windows 11"))
    os = "Windows 11/10";
  else if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac OS")) os = "MacOS";
  else if (userAgent.includes("Linux") || userAgent.includes("Ubuntu"))
    os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";

  return `${browser} / ${os}`;
};
