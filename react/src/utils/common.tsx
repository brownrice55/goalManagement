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

  return getDate;
}

export function getDateForMonthlyGoalArray(
  aStartDateArray: number[][],
  aEndDateArray: number[][],
  aIsCustom: boolean
) {
  const monthlyArray = [];
  const last = aIsCustom ? aEndDateArray : aEndDateArray.at(-1);
  let lastArray = last ? (aIsCustom ? last[0] : last) : [[0, 0, 0]];
  if (!Array.isArray(lastArray)) {
    lastArray = [lastArray];
  }
  const [yearEnd, monthEnd] = lastArray;
  aStartDateArray.forEach((val: number[], index: number) => {
    const [year, month] = val;
    for (let cnt = 0; cnt < 12; ++cnt) {
      let newMonth: number = month + cnt;
      const newYear: number = newMonth > 12 ? year + 1 : year;
      newMonth = newMonth > 12 ? newMonth - 12 : newMonth;
      if (aIsCustom && newYear == yearEnd && newMonth == monthEnd) {
        return monthlyArray.push([newYear, newMonth, index]);
      }
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
    weekArray.push([aYear, aMonth, aDate, firstMonday - 1]);
  }
  for (let cnt = 0; cnt < 5; ++cnt) {
    const startOfWeek = firstMonday + cnt * 7;
    const endOfweek = startOfWeek + 6;
    if (startOfWeek > theNumberOfDaysInAMonth) {
      return weekArray;
    }
    if (endOfweek <= theNumberOfDaysInAMonth) {
      weekArray.push([aYear, aMonth, startOfWeek, endOfweek]);
    } else {
      weekArray.push([aYear, aMonth, startOfWeek, theNumberOfDaysInAMonth]);
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
    return [
      (new Date(aValues.customDate).getTime() -
        new Date(aValues.date).getTime()) /
        86400000,
      [],
    ];
  }

  const getDiffFrom1monthTo1year = (
    aTimes: number,
    aYear: number,
    aMonth: number
  ) => {
    let daysOfTheYear = getDaysOfTheYear(aYear, aMonth);
    let days = getTheNumberOfDaysInAMonth(aMonth, daysOfTheYear);
    const monthlyGoalsPeriod = [[aYear, aMonth, 1]];

    let isNewYear = false;
    let nextYear = aYear;
    let nextMonth = aMonth;
    for (let cnt = 1; cnt <= aTimes; ++cnt) {
      nextMonth = aMonth + cnt;
      if (nextMonth > 12) {
        nextMonth = nextMonth - 12;
        if (!isNewYear) {
          nextYear = nextYear + 1;
          daysOfTheYear = getDaysOfTheYear(nextYear, nextMonth);
          isNewYear = true;
        }
      }
      if (cnt < aTimes) {
        days += getTheNumberOfDaysInAMonth(nextMonth, daysOfTheYear);
      }
      monthlyGoalsPeriod.push([nextYear, nextMonth, 1]);
    }
    return [days, monthlyGoalsPeriod];
  };

  if (aValues.period === "m1") {
    return getDiffFrom1monthTo1year(1, aYear, aMonth);
  }
  if (aValues.period === "m3") {
    return getDiffFrom1monthTo1year(3, aYear, aMonth);
  }
  if (aValues.period === "m6") {
    return getDiffFrom1monthTo1year(6, aYear, aMonth);
  }
  if (aValues.period === "1") {
    return getDiffFrom1monthTo1year(12, aYear, aMonth);
  }
  return 0;
}
