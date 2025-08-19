import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  getData,
  getDateArray,
  getDaysOfTheYear,
  getTheNumberOfDaysInAMonth,
} from "../../utils/common";
import type { Inputs } from "../../types/inputs.type";
import "./settings.css";

type FormSettings0Props = {
  keyNumber: number;
  onUpdate: (value: number, value2: number) => void;
};
export default function FormSettings0({
  keyNumber,
  onUpdate,
}: FormSettings0Props) {
  const originalData = getData();
  const data = originalData ? originalData : new Map();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [periodClassName, setPeriodClassName] = useState<string>("mt-3 mb-4");

  const setDateInInput = (aDiff: number, aDate: string) => {
    const [dateY, dateM, dateD] = getDateArray(aDiff, aDate);
    const dateMstring = dateM < 10 ? `0${dateM}` : String(dateM);
    const dateDstring = dateD < 10 ? `0${dateD}` : String(dateD);

    const newValue = `${dateY}-${dateMstring}-${dateDstring}`;
    const newMin = aDiff
      ? newValue
      : `${dateY - 1}-${dateMstring}-${dateDstring}`;
    const newMax = `${dateY + 50}-${dateMstring}-${dateDstring}`;

    return [newValue, newMin, newMax];
  };
  const [dateValue, setDateValue] = useState<string[]>(setDateInInput(0, ""));
  const [customDateValue, setCustomDateValue] = useState<string[]>(
    setDateInInput(1, "")
  );

  const [isCustom, setIsCustom] = useState<boolean>(false);

  const currentDataValue = keyNumber ? data.get(keyNumber) : {};
  const defaultValues = {
    goal: keyNumber ? currentDataValue?.goal : "",
    period: keyNumber ? currentDataValue?.period : "m1",
    date: keyNumber ? currentDataValue?.date : dateValue[0],
    hasPeriod: keyNumber ? currentDataValue?.hasPeriod : "true",
    customDate: keyNumber ? currentDataValue?.customDate : customDateValue[0],
  };

  const keysArray: number[] = originalData.size
    ? Array.from(originalData.keys())
    : [];
  const nextId: number = keyNumber
    ? keyNumber
    : originalData.size
    ? keysArray[keysArray.length - 1] + 1
    : 1;

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Inputs>({
    defaultValues,
    mode: "onChange",
  });

  const onsubmit: SubmitHandler<Inputs> = (values) => {
    const diff: number =
      values.period === "custom"
        ? (new Date(values.customDate).getTime() -
            new Date(values.date).getTime()) /
          86400000
        : 0;
    const [dateY, dateM] = getDateArray(0, values.date);
    const daysOfTheYear = getDaysOfTheYear(dateY, dateM);
    const theNumberOfDaysInAMonth = getTheNumberOfDaysInAMonth(
      dateM,
      daysOfTheYear
    );

    if (diff && diff <= 7) {
      values.status = 4; //todo
    } else if (
      values.period === "m1" ||
      (diff && diff <= theNumberOfDaysInAMonth)
    ) {
      values.status = 3; //week
    } else if (
      values.period === "m3" ||
      values.period === "m6" ||
      (diff && diff <= daysOfTheYear)
    ) {
      values.status = 2; //month
    } else {
      values.status = 1; //year
    }
    data.set(nextId, values);
    localStorage.setItem("goalManagement", JSON.stringify([...data]));
    onUpdate(values.status, nextId);
  };

  const onerror: SubmitErrorHandler<Inputs> = (err) => console.log(err);

  const handleChangeDate = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    place: "date" | "modal"
  ) => {
    if (place === "date") {
      setDateValue(setDateInInput(0, e.target.value));
    }
  };

  const handleChangePeriod = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "custom") {
      handleShow();
    }
  };

  const handleCancel = () => {
    resetField("period");
    handleClose();
  };

  const handleSetDate = () => {
    setIsCustom(true);
    handleClose();
  };

  const handleHasPeriod = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newClassName =
      e.target.value === "true" ? "mt-3 mb-4" : "mt-3 mb-4 checkboxDisabled";
    setPeriodClassName(newClassName);
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  useEffect(() => {
    const newCustomDate = setDateInInput(1, dateValue[0]);
    setCustomDateValue(newCustomDate);
    setValue("customDate", newCustomDate[0]);
  }, [dateValue]);

  return (
    <>
      <Form onSubmit={handleSubmit(onsubmit, onerror)} noValidate>
        <Form.Group className="mb-3">
          <p className="pt-3">あなたが達成したいことは何ですか？</p>
          <Form.Control
            type="text"
            {...register("goal", {
              required: "必須です",
              validate: (val) => {
                if (data.size) {
                  const isDuplicate = [...data].some(
                    ([_, val2]) => val === val2.goal
                  );
                  if (isDuplicate) {
                    return "既に保存している目標名と重複しています";
                  }
                }
              },
            })}
          />
          <p className="text-danger pt-2 small">{errors.goal?.message}</p>
          <p className="small pb-3">
            例）（良い発音の）英語で自信を持って自分の意見を言えるようになる
          </p>
        </Form.Group>

        <Form.Group className="mb-3">
          <p>いつからいつまでの期間で達成したいですか？</p>
          <Form.Check
            type="radio"
            id="period1"
            value="true"
            label="期間あり"
            {...register("hasPeriod", { onChange: (e) => handleHasPeriod(e) })}
          />
          <Row className={periodClassName}>
            <Col sm={4}>
              <Form.Control
                type="date"
                min={dateValue[1]}
                max={dateValue[2]}
                {...register("date", {
                  onChange: (e) => handleChangeDate(e, "date"),
                })}
              />
            </Col>
            <Col sm={2} className="text-center">
              から
            </Col>
            <Col sm={4}>
              {isCustom ? (
                <Form.Control
                  type="date"
                  min={customDateValue[1]}
                  max={customDateValue[2]}
                  {...register("customDate", {
                    onChange: (e) => handleChangeDate(e, "modal"),
                  })}
                />
              ) : (
                <Form.Select
                  {...register("period", {
                    onChange: (e) => handleChangePeriod(e),
                  })}
                >
                  <option value="m1">1ヶ月</option>
                  <option value="m3">3ヶ月</option>
                  <option value="m6">半年</option>
                  {Array(10)
                    .fill(0)
                    .map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}年
                      </option>
                    ))}
                  <option value="custom">カスタム</option>
                </Form.Select>
              )}
            </Col>
            <Col sm={2} className="text-center">
              の期間
              <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                  <p>期間を選んでください</p>
                </Modal.Header>
                <Modal.Body>
                  <Form.Control
                    type="date"
                    min={customDateValue[1]}
                    max={customDateValue[2]}
                    {...register("customDate", {
                      onChange: (e) => handleChangeDate(e, "modal"),
                    })}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCancel}>
                    キャンセル
                  </Button>
                  <Button variant="primary" onClick={handleSetDate}>
                    決定する
                  </Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
          <Form.Check
            type="radio"
            id="period2"
            value="false"
            label="期間なし（todoの設定のみ）"
            {...register("hasPeriod")}
          />
          <Form.Control
            type="hidden"
            {...register("status", {
              valueAsNumber: true,
            })}
            value={1}
          />
        </Form.Group>
        <div className="text-center mt-4">
          <Button variant="primary" type="submit" className="py-3 px-5">
            保存して次へ
          </Button>
        </div>
      </Form>
    </>
  );
}
