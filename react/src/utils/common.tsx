import type { Inputs } from "../types/inputs.type";
export function getData() {
  let data = new Map<number, Inputs>();
  const dataFromLocalStorage: string | null =
    localStorage.getItem("goalManagement");
  if (dataFromLocalStorage !== "undefined") {
    if (typeof dataFromLocalStorage === "string") {
      const dataJson = JSON.parse(dataFromLocalStorage);
      data = new Map(dataJson);
    } else {
      data = new Map(null);
    }
  }
  return data;
}

export function getDateArray(aDiff: number, aDate: string) {
  const now = aDate ? new Date(aDate) : new Date();
  now.setDate(now.getDate() + aDiff);

  const dateY = now.getFullYear();
  const dateM = now.getMonth() + 1;
  const dateD = now.getDate();
  return [dateY, dateM, dateD];
}

export function getDaysOfTheYear(aYear: number, aMonth: number) {
  const startYear = aMonth > 2 ? aYear + 1 : aYear;
  if (startYear % 100 === 0 && startYear % 400 !== 0) {
    return 365;
  }
  if (startYear % 4 === 0) {
    return 366;
  }
  return 365;
}

export function getTheNumberOfDaysInAMonth(
  aMonth: number,
  aDaysOfTheYear: number
) {
  const daysOfTheEachMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (aDaysOfTheYear == 366) {
    daysOfTheEachMonths[1] = 29;
  }
  return daysOfTheEachMonths[aMonth - 1];
}

export function getDateForAnnualGoal(
  aMultiplier: number,
  aStateDateString: string,
  isStart: boolean
) {
  const stateDateString = aStateDateString.split("-").map(Number);
  const startYear = stateDateString[0];
  const startMonth = stateDateString[1];

  let daysOfTheYear = getDaysOfTheYear(startYear, startMonth);
  if (isStart) {
    ++daysOfTheYear;
  }

  const diff = daysOfTheYear * aMultiplier;
  const getDate = getDateArray(diff, aStateDateString);

  const [dateY, dateM, dateD] = getDate;
  const date = `${dateY}/${dateM}/${dateD}`;
  return date;
}
