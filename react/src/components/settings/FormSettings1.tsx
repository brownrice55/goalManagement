import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {
  getData,
  getDateForAnnualGoal,
  getDaysOfTheYear,
  getDateArray,
} from "../../utils/common";
import type { Inputs } from "../../types/inputs.type";

type FormSettings1Props = {
  keyNumber: number;
  onUpdate: (value: number, value2: number) => void;
};
export default function FormSettings1({
  keyNumber,
  onUpdate,
}: FormSettings1Props) {
  const data = getData();
  const currentDataValue = data.get(keyNumber);

  const getCustomYearAndRemainder = (aDiff: number) => {
    if (!currentDataValue || !currentDataValue.date) {
      return;
    }
    const tentativeYearNum = Math.floor(aDiff / 365);
    const array = currentDataValue?.date.split("-").map(Number);
    const daysOfTheYearArray = Array(tentativeYearNum + 1);
    for (let cnt = 0; cnt < tentativeYearNum + 1; ++cnt) {
      daysOfTheYearArray[cnt] = getDaysOfTheYear(array[0] + cnt, array[1]);
    }

    const sum = daysOfTheYearArray.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    const yearNum =
      sum >= aDiff ? daysOfTheYearArray.length - 1 : daysOfTheYearArray.length;

    return yearNum;
  };

  const customYearAndRemainder = getCustomYearAndRemainder(
    currentDataValue ? currentDataValue?.diff : 0
  );

  const arrayLength =
    currentDataValue?.period === "custom"
      ? customYearAndRemainder
      : Number(currentDataValue?.period);

  const endDate =
    currentDataValue?.period === "custom"
      ? currentDataValue?.customDate.replace(/-/g, "/")
      : currentDataValue
      ? getDateForAnnualGoal(
          arrayLength ? arrayLength : 1,
          currentDataValue.date,
          false
        )
      : "";

  const startDateArray = currentDataValue
    ? new Array(arrayLength)
        .fill(0)
        .map((_, index) =>
          getDateForAnnualGoal(index, currentDataValue.date, true)
        )
    : [];
  const endDateArray = currentDataValue
    ? new Array(arrayLength)
        .fill(0)
        .map((_, index) =>
          getDateForAnnualGoal(index + 1, currentDataValue.date, false)
        )
    : [];

  if (
    currentDataValue?.period === "custom" &&
    endDateArray &&
    endDateArray.length
  ) {
    const endDataLast = endDateArray?.at(-1)?.replace(/\//g, "-");
    if (endDataLast) {
      const startDateLast = getDateArray(1, endDataLast);
      startDateArray.push(startDateLast.join("/"));
    }
    endDateArray.push(currentDataValue?.customDate.replace(/-/g, "/"));
  }

  const defaultValues = {
    goal: currentDataValue?.goal,
    annualGoals: [],
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Inputs>({
    defaultValues,
    mode: "onChange",
  });

  const onsubmit: SubmitHandler<Inputs> = (values) => {
    if (currentDataValue) {
      currentDataValue.goal = values.goal;
      currentDataValue.annualGoals = values.annualGoals;
      currentDataValue.status = values.status;
      currentDataValue.startDateArray = startDateArray;
      currentDataValue.endDateArray = endDateArray;
      data.set(keyNumber, currentDataValue);
      localStorage.setItem("goalManagement", JSON.stringify([...data]));
      onUpdate(values.status, keyNumber);
    }
  };
  const onerror: SubmitErrorHandler<Inputs> = (err) => console.log(err);

  const handleBack = () => {
    onUpdate(0, keyNumber);
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <>
      <Form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
        <p className="mt-3">
          {currentDataValue?.date.replace(/-/g, "/")}から{endDate}
          までに達成したいこと
        </p>
        <Form.Group className="mb-3">
          <p className="pt-3">あなたが達成したいことは何ですか？</p>
          <Form.Control
            type="text"
            {...register("goal", {
              required: "必須です",
            })}
          />
          <div className="text-danger pt-2 small">{errors.goal?.message}</div>
          <p className="pt-2 pb-5">
            上記を達成するための年ごとの目標を書きましょう。
            <br />
            2年目以降の目標は、後から立てることもできます。
          </p>
        </Form.Group>

        <Form.Group>
          {startDateArray.map((_, index) => (
            <div key={index}>
              <p>
                {index + 1}年目の目標（{startDateArray[index]}から
                {endDateArray[index]}まで）
                {!index && <span className="text-danger">※</span>}
              </p>
              <Form.Control
                className={!index ? "mb-3" : "mb-4"}
                type="text"
                {...register(`annualGoals.${index}`, {
                  required: !index ? "必須です" : false,
                })}
              />
              <p className="text-danger small">
                {errors.annualGoals?.[index]?.message}
              </p>
              {!index && (
                <p className="mb-5 small text-secondary">
                  例）英語テストAを受験して一次試験に合格する
                </p>
              )}
            </div>
          ))}
        </Form.Group>

        <Form.Control
          type="hidden"
          {...register("status", {
            valueAsNumber: true,
          })}
          value={2}
        />
        <div className="text-center mt-4">
          <Button
            variant="primary"
            type="button"
            className="py-3 px-5 me-3"
            onClick={handleBack}
          >
            戻る
          </Button>
          <Button variant="primary" type="submit" className="py-3 px-5">
            保存して次へ
          </Button>
        </div>
      </Form>
    </>
  );
}
