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

  const activeWeeklyGoalsLength =
    currentDataValue?.weeklyGoals.filter((val) => val).length ?? 0;
  const arrayFormFields = Array.from(
    { length: activeWeeklyGoalsLength },
    () => [""]
  );
  const [formFields, setFormFields] = useState<string[][]>(arrayFormFields);

  const arrayTodo = Array.from({ length: activeWeeklyGoalsLength }, () => [""]);
  const [todo, setTodo] = useState<string[][]>(arrayTodo);

  const arrayFrequency = Array.from({ length: activeWeeklyGoalsLength }, () => [
    [true, false, false, false],
  ]);
  const [frequencyChecks, setFrequencyChecks] =
    useState<boolean[][][]>(arrayFrequency);
  const arrayYoubi = Array.from({ length: activeWeeklyGoalsLength }, () => [
    [true, true, true, true, true, true, true],
  ]);
  const [youbiChecks, setYoubiChecks] = useState<boolean[][][]>(arrayYoubi);

  const arrayCustomClass = Array.from(
    { length: activeWeeklyGoalsLength },
    () => ["d-flex checkboxDisabled"]
  );
  const [customClass, setCustomClass] = useState<string[][]>(arrayCustomClass);

  const [selectIndex, setSelectIndex] = useState<number>(0);

  const handleAddInput = () => {
    setFormFields((prev) =>
      prev.map((fields, index) =>
        index === selectIndex ? [...fields, ""] : fields
      )
    );

    const addedFrequency = [true, false, false, false];
    setFrequencyChecks((prev) =>
      prev.map((fields, index) =>
        index === selectIndex ? [...fields, addedFrequency] : fields
      )
    );

    const addedYoubi = Array(7).fill(true);
    setYoubiChecks((prev) =>
      prev.map((fields, index) =>
        index === selectIndex ? [...fields, addedYoubi] : fields
      )
    );

    const addedClass = "d-flex checkboxDisabled";
    setCustomClass((prev) =>
      prev.map((fields, index) =>
        index === selectIndex ? [...fields, addedClass] : fields
      )
    );
  };

  const handleYoubi = (aSelectIndex: number, aCnt: number, aIndex: number) => {
    setYoubiChecks((prev) => {
      const newYoubi = [...prev];
      newYoubi[aSelectIndex] = [...newYoubi[aSelectIndex]];
      newYoubi[aSelectIndex][aCnt] = [...newYoubi[aSelectIndex][aCnt]];
      newYoubi[aSelectIndex][aCnt][aIndex] =
        !youbiChecks[aSelectIndex][aCnt][aIndex];
      return newYoubi;
    });
  };

  const handleFrequency = (
    aSelectIndex: number,
    aCnt: number,
    aIndex: number
  ) => {
    const resetFrequency = Array(4).fill(false);
    resetFrequency[aIndex] = true;
    const newFrequency = [...frequencyChecks];
    newFrequency[aSelectIndex][aCnt] = resetFrequency;
    setFrequencyChecks(newFrequency);
    let resetYoubi = Array(7).fill(false);
    const newCustomClass = [...customClass];
    if (aIndex === 3) {
      //custom
      newCustomClass[aSelectIndex][aCnt] = "d-flex";
    } else {
      newCustomClass[aSelectIndex][aCnt] = "d-flex checkboxDisabled";
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
    const newYoubi = [...youbiChecks];
    newYoubi[aSelectIndex][aCnt] = resetYoubi;
    setYoubiChecks(newYoubi);
  };

  const handleSelect = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const targetValue = Number(e.target.value);
    setSelectIndex(targetValue);
  };

  const handleTodo = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    aSelectIndex: number,
    aCnt: number
  ) => {
    setTodo((prev) => {
      const newTodo = prev.map((arr) => [...arr]);
      newTodo[aSelectIndex][aCnt] = e.target.value;
      return newTodo;
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
        <Form.Group className="mb-3">
          <Form.Select
            {...(register("weeklyGoals"), { onChange: (e) => handleSelect(e) })}
          >
            {currentDataValue?.weeklyGoalsPeriod.map(
              (val, index) =>
                currentDataValue?.weeklyGoals[index] && (
                  <option key={index} value={index}>
                    {val[0]}年{val[1]}月{val[2]}日〜{val[3]}日：
                    {currentDataValue?.weeklyGoals[index]}
                  </option>
                )
            )}
          </Form.Select>
        </Form.Group>
        {formFields[selectIndex]?.map((_, cnt) => {
          const registerResult = register(`todo.${selectIndex}.${cnt}`, {
            required: selectIndex === 0 && cnt === 0 ? "必須です" : false,
          });
          const { onChange, ...restRegister } = registerResult;

          return (
            <Form.Group className="my-5" key={cnt}>
              <Form.Control
                type="text"
                value={todo[selectIndex][cnt] ?? ""}
                onChange={(e) => {
                  onChange(e);
                  handleTodo(e, selectIndex, cnt);
                  if (registerResult?.onChange) registerResult.onChange(e);
                }}
                {...restRegister}
              />
              <p className="text-danger small mt-2">
                {selectIndex === 0 &&
                  cnt === 0 &&
                  errors.todo?.[selectIndex]?.[cnt]?.message}
              </p>

              <div className="d-flex">
                {frequencyTextArray.map((val, index) => (
                  <Form.Check
                    type="radio"
                    key={selectIndex + "_" + cnt + "_" + index}
                    id={`frequency_${selectIndex}_${cnt}_${index}`}
                    label={val}
                    className="pe-4 pt-3"
                    checked={frequencyChecks[selectIndex][cnt][index]}
                    onChange={() => handleFrequency(selectIndex, cnt, index)}
                  />
                ))}
              </div>
              <div className={customClass[selectIndex][cnt]}>
                {youbiTextArray.map((val, index) => (
                  <Form.Check
                    type="checkbox"
                    key={selectIndex + "_" + cnt + "_" + index}
                    id={`youbi_${selectIndex}_${cnt}_${index}`}
                    label={val}
                    className="pe-4 pt-3"
                    checked={youbiChecks[selectIndex][cnt][index]}
                    onChange={() => handleYoubi(selectIndex, cnt, index)}
                  />
                ))}
              </div>
              <div className="d-flex">
                {othersTextArray.map((val, index) => (
                  <Form.Check
                    type="checkbox"
                    key={selectIndex + "_" + cnt + "_" + index}
                    id={`others_${selectIndex}_${cnt}_${index}`}
                    label={val}
                    className="pe-4 pt-3"
                    {...register(`othersChecks.${selectIndex}.${cnt}.${index}`)}
                  />
                ))}
              </div>
            </Form.Group>
          );
        })}
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
            完了する
          </Button>
        </div>
      </Form>
    </>
  );
}
