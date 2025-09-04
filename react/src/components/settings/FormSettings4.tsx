import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { getData } from "../../utils/common";
import type { InputsTodo } from "../../types/inputsTodo.type";

type FormSettings4Props = {
  keyNumber: number;
  onUpdate: (value: number, value2: number) => void;
};
export default function FormSettings4({
  keyNumber,
  onUpdate,
}: FormSettings4Props) {
  const data = getData();
  const currentDataValue = data.get(keyNumber);

  const defaultValues = {
    todo: "",
    originalKey: 0,
    weeklyGoals: 1,
    frequencyChecks: [true, false, false, false],
    youbiChecks: [true, true, true, true, true, true, true],
    othersChecks: [false, false],
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<InputsTodo>({
    defaultValues,
    mode: "onChange",
  });

  const onsubmit: SubmitHandler<InputsTodo> = (values) => {
    console.log(values);
    if (currentDataValue) {
      data.set(keyNumber, currentDataValue);
      localStorage.setItem("goalManagement", JSON.stringify([...data]));
    }
  };
  const onerror: SubmitErrorHandler<InputsTodo> = (err) => console.log(err);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const handleBack = () => {
    const status = currentDataValue?.monthlyGoals ? 3 : 0;
    onUpdate(status, keyNumber);
  };

  const frequencyTextArray = ["毎日", "平日のみ", "土日のみ", "カスタム"];
  const youbiTextArray = ["月", "火", "水", "木", "金", "土", "日"];
  const othersTextArray = ["前倒しOK", "隔週"];

  const inputFieldArray = [""];
  const [form, setForm] = useState<string[]>(inputFieldArray);
  const handleAddInput = () => {
    const newForm = [...form, ""];
    setForm(newForm);
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
        <p className="mt-3"></p>
        <Form.Group className="mb-3">
          <Form.Select {...register("weeklyGoals")}>
            {currentDataValue?.weeklyGoalsPeriod.map(
              (val, index) =>
                currentDataValue?.weeklyGoals[index] && (
                  <option key={index} value={index + 1}>
                    {val[0]}年{val[1]}月{val[2]}日〜{val[3]}日：
                    {currentDataValue?.weeklyGoals[index]}
                  </option>
                )
            )}
          </Form.Select>
        </Form.Group>
        {form.map((_, cnt) => (
          <Form.Group className="my-5" key={cnt}>
            <Form.Control
              type="text"
              {...register("todo", {
                required: "必須です",
              })}
            />
            <div className="d-flex">
              {frequencyTextArray.map((val, index) => (
                <Form.Check
                  type="radio"
                  key={index}
                  id={`frequency-${cnt}-${index}`}
                  value="true"
                  label={val}
                  className="pe-4 pt-3"
                  {...register(`frequencyChecks.${index}`)}
                />
              ))}
            </div>
            <div className="d-flex checkboxDisabled">
              {youbiTextArray.map((val, index) => (
                <Form.Check
                  type="checkbox"
                  key={index}
                  id={`youbi-${cnt}-${index}`}
                  value="true"
                  label={val}
                  className="pe-4 pt-3"
                  {...register(`youbiChecks.${index}`)}
                />
              ))}
            </div>
            <div className="d-flex">
              {othersTextArray.map((val, index) => (
                <Form.Check
                  type="checkbox"
                  key={index}
                  id={`others-${cnt}-${index}`}
                  value="true"
                  label={val}
                  className="pe-4 pt-3"
                  {...register(`othersChecks.${index}`)}
                />
              ))}
            </div>
          </Form.Group>
        ))}

        <Form.Group className="text-end mb-5">
          <Button onClick={handleAddInput}>todoを追加する</Button>
        </Form.Group>

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
