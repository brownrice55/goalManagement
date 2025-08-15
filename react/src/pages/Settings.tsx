import Header from "../components/Header";
import FormSettings0 from "../components/settings/FormSettings0";

export default function Settings() {
  return (
    <>
      <Header
        title="設定"
        description="設定のページです"
        keywords="目標設定, 登録"
      />
      <FormSettings0 />
    </>
  );
}
