import { useState } from "react";
import Header from "../components/Header";
import FormSettings0 from "../components/settings/FormSettings0";
import FormSettings1 from "../components/settings/FormSettings1";
import FormSettings2 from "../components/settings/FormSettings2";
import FormSettings3 from "../components/settings/FormSettings3";
import FormSettings4 from "../components/settings/FormSettings4";

export default function Settings() {
  const [status, setStatus] = useState<number>(0);
  const handleUpdate = (updatedStatus: number, updatedKeyNumber: number) => {
    setStatus(updatedStatus);
    setKeyNumber(updatedKeyNumber);
  };

  const [keyNumber, setKeyNumber] = useState<number>(0);
  return (
    <>
      <Header
        title="設定"
        description="設定のページです"
        keywords="目標設定, 登録"
      />
      {status === 0 ? (
        <FormSettings0 keyNumber={keyNumber} onUpdate={handleUpdate} />
      ) : status === 1 ? (
        <FormSettings1 keyNumber={keyNumber} onUpdate={handleUpdate} />
      ) : status === 2 ? (
        <FormSettings2 keyNumber={keyNumber} onUpdate={handleUpdate} />
      ) : status === 3 ? (
        <FormSettings3 keyNumber={keyNumber} onUpdate={handleUpdate} />
      ) : status === 4 ? (
        <FormSettings4 keyNumber={keyNumber} onUpdate={handleUpdate} />
      ) : (
        ""
      )}
    </>
  );
}
