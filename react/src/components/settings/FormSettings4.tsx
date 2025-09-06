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
    todo: [""],
    originalKey: 0,
    weeklyGoals: 1,
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

  const [frequency, setFrequency] = useState<boolean[][]>([
    [true, false, false, false],
  ]);
  const [youbi, setYoubi] = useState<boolean[][]>([Array(7).fill(true)]);

  const [formFields, setFormFields] = useState([{ todo: "" }]);
  const [customClass, setCustomClass] = useState<string[]>([
    "d-flex checkboxDisabled",
  ]);

  const handleAddInput = () => {
    setFormFields([...formFields, { todo: "" }]);
    const addedFrequency = [true, false, false, false];
    const newFrequency = [...frequency];
    newFrequency.push(addedFrequency);
    setFrequency(newFrequency);
    const addedYoubi = Array(7).fill(true);
    const newYoubi = [...youbi];
    newYoubi.push(addedYoubi);
    setYoubi(newYoubi);
    const addedClass = "d-flex checkboxDisabled";
    const newCustomClass = [...customClass];
    newCustomClass.push(addedClass);
    setCustomClass(newCustomClass);
  };

  const handleYoubi = (aCnt: number, aIndex: number) => {
    const newYoubi = [...youbi];
    newYoubi[aCnt][aIndex] = !youbi[aCnt][aIndex];
    setYoubi(newYoubi);
  };

  const handleFrequency = (aCnt: number, aIndex: number) => {
    const resetFrequency = Array(4).fill(false);
    resetFrequency[aIndex] = true;
    const newFrequency = [...frequency];
    newFrequency[aCnt] = resetFrequency;
    setFrequency(newFrequency);
    let resetYoubi = Array(7).fill(false);
    const newCustomClass = [...customClass];
    if (aIndex === 3) {
      //custom
      newCustomClass[aCnt] = "d-flex";
    } else {
      newCustomClass[aCnt] = "d-flex checkboxDisabled";
      if (aIndex === 0) {
        resetYoubi = Array(7).fill(true);
      } else if (aIndex === 1) {
        for (let cnt = 0; cnt < 5; ++cnt) {
          resetYoubi[cnt] = true;
        }
      } else {
        resetYoubi[5] = true;
        resetYoubi[6] = true;
      }
    }
    setCustomClass(newCustomClass);
    const newYoubi = [...youbi];
    newYoubi[aCnt] = resetYoubi;
    setYoubi(newYoubi);
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
        {formFields.map((_, cnt) => (
          <Form.Group className="my-5" key={cnt}>
            <Form.Control
              type="text"
              {...register(`todo.${cnt}`, {
                required: "必須です",
              })}
            />
            <div className="d-flex">
              {frequencyTextArray.map((val, index) => (
                <Form.Check
                  type="radio"
                  key={cnt + "_" + index}
                  id={`frequency_${cnt}-${index}`}
                  label={val}
                  className="pe-4 pt-3"
                  checked={frequency[cnt][index]}
                  {...(register(`frequencyChecks.${cnt}.${index}`),
                  { onChange: () => handleFrequency(cnt, index) })}
                />
              ))}
            </div>
            <div className={customClass[cnt]}>
              {youbiTextArray.map((val, index) => (
                <Form.Check
                  type="checkbox"
                  key={cnt + "_" + index}
                  id={`youbi_${cnt}-${index}`}
                  value={"true"}
                  label={val}
                  className="pe-4 pt-3"
                  checked={youbi[cnt][index]}
                  {...(register(`youbiChecks.${cnt}.${index}`),
                  { onChange: () => handleYoubi(cnt, index) })}
                />
              ))}
            </div>
            <div className="d-flex">
              {othersTextArray.map((val, index) => (
                <Form.Check
                  type="checkbox"
                  key={cnt + "_" + index}
                  id={`others_${cnt}-${index}`}
                  value="true"
                  label={val}
                  className="pe-4 pt-3"
                  {...register(`othersChecks.${cnt}.${index}`)}
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
