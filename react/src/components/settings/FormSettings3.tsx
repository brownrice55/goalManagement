import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { getData, getWeekArray } from "../../utils/common";
import type { Inputs } from "../../types/inputs.type";

type FormSettings3Props = {
  keyNumber: number;
  onUpdate: (value: number, value2: number) => void;
};
export default function FormSettings3({
  keyNumber,
  onUpdate,
}: FormSettings3Props) {
  const data = getData();
  const currentDataValue = data.get(keyNumber);
  const monthlyGoalsPeriodInitial = currentDataValue?.monthlyGoalsPeriod[0].map(
    Number
  ) ?? [0, 0, 0];
  const [monthlyGoalsPeriodArray, setMonthlyGoalsPeriodArray] = useState<
    number[]
  >(monthlyGoalsPeriodInitial);
  const startDateArray: number[] = currentDataValue?.date
    .split("-")
    .map(Number) ?? [0, 0, 0];
  const endDateArray: number[] = currentDataValue?.endDate ?? [0, 0, 0];
  const startDate =
    monthlyGoalsPeriodArray[0] === startDateArray[0] &&
    monthlyGoalsPeriodArray[1] === startDateArray[1]
      ? startDateArray[2]
      : 1;
  const endDate =
    monthlyGoalsPeriodArray[0] === endDateArray[0] &&
    monthlyGoalsPeriodArray[1] === endDateArray[1]
      ? endDateArray[2]
      : 0;

  const weeklyGoalsPeriod = getWeekArray(
    monthlyGoalsPeriodArray[0],
    monthlyGoalsPeriodArray[1],
    startDate,
    endDate
  );

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
    const status = currentDataValue?.monthlyGoals ? 2 : 0;
    onUpdate(status, keyNumber);
  };

  const handleChangePeriod = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = Number(e.target.value);
    const nextValue = currentDataValue?.monthlyGoalsPeriod[targetValue - 1].map(
      Number
    ) ?? [0, 0, 0];
    setMonthlyGoalsPeriodArray(nextValue);
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
        <p className="mt-3">
          {!currentDataValue?.monthlyGoalsPeriod ? (
            <span className="text-danger">※</span>
          ) : (
            <span>
              {monthlyGoalsPeriodArray[0]}年{monthlyGoalsPeriodArray[1]}
              月に達成したいこと
            </span>
          )}
        </p>
        <Form.Group className="mb-3">
          {currentDataValue?.monthlyGoals ? (
            <>
              <Form.Select
                {...register("period", {
                  onChange: (e) => handleChangePeriod(e),
                })}
              >
                {currentDataValue?.monthlyGoals.map(
                  (val, index) =>
                    val && (
                      <option key={index} value={index + 1}>
                        {val}
                      </option>
                    )
                )}
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
            上記を達成するための週ごとの目標を書きましょう。
            <br />
            後で変更することもできます。
          </p>
        </Form.Group>

        <Form.Group>
          {weeklyGoalsPeriod?.map((val, index) => (
            <div key={index}>
              {val[0] === monthlyGoalsPeriodArray[0] &&
              val[1] === monthlyGoalsPeriodArray[1] ? (
                <div>
                  <p>
                    {val[0]}/{val[1]}/{val[2]}から{val[0]}/{val[1]}/{val[3]}
                    の目標
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
          value={4}
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
