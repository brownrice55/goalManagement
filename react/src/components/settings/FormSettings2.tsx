import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {
  getData,
  getDateForMonthlyGoalArray,
  optionArray,
  getDateArray,
} from "../../utils/common";
import type { Inputs } from "../../types/inputs.type";

type FormSettings2Props = {
  keyNumber: number;
  onUpdate: (value: number, value2: number) => void;
};
export default function FormSettings2({
  keyNumber,
  onUpdate,
}: FormSettings2Props) {
  const data = getData();
  const currentDataValue = data.get(keyNumber);

  const startDateArray = currentDataValue?.annualGoals
    ? currentDataValue?.startDateArray
    : [];
  const endDateArray = currentDataValue?.annualGoals
    ? currentDataValue?.endDateArray
    : [];

  const endDate =
    currentDataValue && currentDataValue?.period !== "custom"
      ? "(" +
        getDateArray(currentDataValue?.diff, currentDataValue?.date).join("/") +
        ")"
      : currentDataValue?.customDate.replace(/-/g, "/");
  const endDateSub = currentDataValue?.annualGoals
    ? ""
    : currentDataValue?.period === "1"
    ? "1年後"
    : currentDataValue?.period !== "custom"
    ? optionArray.filter((val) => val[0] === currentDataValue?.period)[0][1]
    : "";

  const [dateFromToText, setDateFromToText] = useState<string>(
    currentDataValue?.annualGoals
      ? `${startDateArray[0]}から${endDateArray[0]}`
      : `${currentDataValue?.date.replace(
          /-/g,
          "/"
        )}から${endDateSub}${endDate}`
  );
  const [currentOption, setCurrentOption] = useState<number>(1);

  const monthlyGoalsPeriod = currentDataValue?.annualGoals
    ? getDateForMonthlyGoalArray(startDateArray, endDateArray, false)
    : currentDataValue && currentDataValue.period === "custom"
    ? getDateForMonthlyGoalArray(
        [currentDataValue?.date.split("-").map(Number)],
        [currentDataValue?.customDate.split("-").map(Number)],
        true
      )
    : currentDataValue.monthlyGoalsPeriod;

  const defaultValues = {
    goal: currentDataValue?.goal,
    monthlyGoals: [],
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
      if (!currentDataValue.monthlyGoalsPeriod) {
        currentDataValue.monthlyGoalsPeriod = monthlyGoalsPeriod;
      }
      currentDataValue.monthlyGoals = values.monthlyGoals;
      currentDataValue.status = values.status;
      data.set(keyNumber, currentDataValue);
      localStorage.setItem("goalManagement", JSON.stringify([...data]));
      onUpdate(values.status, keyNumber);
    }
  };
  const onerror: SubmitErrorHandler<Inputs> = (err) => console.log(err);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const handleBack = () => {
    const status = currentDataValue?.annualGoals ? 1 : 0;
    onUpdate(status, keyNumber);
  };

  const handleChangePeriod = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = Number(e.target.value);
    setDateFromToText(
      `${currentDataValue?.startDateArray[targetValue - 1]}から${
        currentDataValue?.endDateArray[targetValue - 1]
      }`
    );
    setCurrentOption(targetValue);
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
        <p className="mt-3">
          {dateFromToText}までに達成したいこと
          {!currentDataValue?.annualGoals && (
            <span className="text-danger">※</span>
          )}
        </p>
        <Form.Group className="mb-3">
          {currentDataValue?.annualGoals ? (
            <>
              <Form.Select
                {...register("period", {
                  onChange: (e) => handleChangePeriod(e),
                })}
              >
                {currentDataValue?.annualGoals.map((val, index) => (
                  <option key={index} value={index + 1}>
                    {index + 1}年目：{val}
                  </option>
                ))}
              </Form.Select>
            </>
          ) : (
            <>
              <Form.Control
                type="text"
                {...register("goal", {
                  required: "必須です",
                })}
              />
              <p className="text-danger small mt-2">{errors.goal?.message}</p>
            </>
          )}
          <p className="pt-2 pb-4">
            上記を達成するための月ごとの目標を書きましょう。
            <br />
            後で変更することもできます。
          </p>
        </Form.Group>

        <Form.Group>
          {monthlyGoalsPeriod.map((val, index) => (
            <div key={index}>
              {val[2] === currentOption ? (
                <div>
                  <p>
                    {val[0]}年{val[1]}月の目標
                    {(!index || index === 1) && (
                      <span className="text-danger">※</span>
                    )}
                  </p>
                  <Form.Control
                    className={!index || index === 1 ? "mb-3" : "mb-4"}
                    type="text"
                    {...register(`monthlyGoals.${index}`, {
                      required: !index || index === 1 ? "必須です" : false,
                    })}
                  />
                  <p className="text-danger small">
                    {errors.monthlyGoals?.[index]?.message}
                  </p>
                </div>
              ) : (
                ""
              )}
            </div>
          ))}
        </Form.Group>

        <Form.Control
          type="hidden"
          {...register("status", {
            valueAsNumber: true,
          })}
          value={3}
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
