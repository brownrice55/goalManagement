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

export function getDateForMonthlyGoalArray(
  aStartDateArray: string[],
  aEndDateArray: string[]
) {
  const monthlyArray = [];
  const last = aEndDateArray.at(-1);
  const [yearEnd, monthEnd] = last ? last.split("/").map(Number) : [0, 0];
  aStartDateArray.forEach((val: string, index: number) => {
    const [year, month] = val.split("/").map(Number);
    for (let cnt = 0; cnt < 12; ++cnt) {
      let newMonth = month + cnt;
      const newYear = newMonth > 12 ? year + 1 : year;
      newMonth = newMonth > 12 ? newMonth - 12 : newMonth;
      if (!cnt && index) {
        monthlyArray.push([newYear, newMonth, index]);
      }
      monthlyArray.push([newYear, newMonth, index + 1]);
    }
  });
  monthlyArray.push([yearEnd, monthEnd, aStartDateArray.length]);
  return monthlyArray;
}

export function getWeekArray(aYear: number, aMonth: number, aDate: number) {
  const daysOfTheYear = getDaysOfTheYear(aYear, aMonth);
  const theNumberOfDaysInAMonth = getTheNumberOfDaysInAMonth(
    aMonth,
    daysOfTheYear
  );

  const firstDayOfTheMonth = new Date(`${aYear}-0${aMonth}-0${aDate}`);
  const dayIndexOfFirstDayOfTheMonth = firstDayOfTheMonth.getDay();

  const addendArray = [1, 7, 6, 5, 4, 3, 2];
  const firstMonday = aDate + addendArray[dayIndexOfFirstDayOfTheMonth];

  const weekArray = [];
  if (firstMonday !== aDate) {
    weekArray.push([aDate, firstMonday - 1]);
  }
  for (let cnt = 0; cnt < 5; ++cnt) {
    const startOfWeek = firstMonday + cnt * 7;
    const endOfweek = startOfWeek + 6;
    if (startOfWeek > theNumberOfDaysInAMonth) {
      return weekArray;
    }
    if (endOfweek <= theNumberOfDaysInAMonth) {
      weekArray.push([startOfWeek, endOfweek]);
    } else {
      weekArray.push([startOfWeek, theNumberOfDaysInAMonth]);
    }
  }
}

export const optionArray = [
  ["m1", "1ヶ月"],
  ["m3", "3ヶ月"],
  ["m6", "半年"],
];

export function getDiff(aValues: Inputs, aYear: number, aMonth: number) {
  if (aValues.period === "custom") {
    return (
      (new Date(aValues.customDate).getTime() -
        new Date(aValues.date).getTime()) /
      86400000
    );
  }

  const getDiffFrom3monthTo1year = (
    aTimes: number,
    aYear: number,
    aMonth: number
  ) => {
    let daysOfTheYear = getDaysOfTheYear(aYear, aMonth);
    let days = getTheNumberOfDaysInAMonth(aMonth, daysOfTheYear);
    const monthlyGoalsPeriod = [[aYear, aMonth, 1]];
    const getNextYearAndMonth = (aCnt: number) => {
      let nextYear = aYear;
      let nextMonth = aMonth + aCnt;
      if (nextMonth > 12) {
        nextYear = aYear + aCnt;
        nextMonth = nextMonth - 12;
        daysOfTheYear = getDaysOfTheYear(nextYear, nextMonth);
      }
      return [nextYear, nextMonth, daysOfTheYear];
    };
    for (let cnt = 1; cnt <= aTimes; ++cnt) {
      const [nextYear, nextMonth, daysOfTheYear] = getNextYearAndMonth(cnt);
      if (cnt < aTimes) {
        days += getTheNumberOfDaysInAMonth(nextMonth, daysOfTheYear);
      }
      monthlyGoalsPeriod.push([nextYear, nextMonth, 1]);
    }
    return [days, monthlyGoalsPeriod];
  };

  if (aValues.period === "m3") {
    return getDiffFrom3monthTo1year(3, aYear, aMonth);
  }
  if (aValues.period === "m6") {
    return getDiffFrom3monthTo1year(6, aYear, aMonth);
  }
  return 0;
}
