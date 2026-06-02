import Holidays from "date-holidays";

const hd = new Holidays("ID");

export const checkIsWeekendOrHoliday = (dateObj) => {
  const dayOfWeek = dateObj.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) return true;

  const holidayList = hd.isHoliday(dateObj);
  if (holidayList && holidayList.length > 0) {
    const isPublicHoliday = holidayList.some(
      (holiday) => holiday.type === "public",
    );
    if (isPublicHoliday) return true;
  }

  return false;
};
