import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import App from "../App";
import Todos from "../pages/Todos";
import Settings from "../pages/Settings";
import RewardsSettings from "../pages/RewardsSettings";
import Result from "../pages/Result";
import NotFound from "../pages/NotFound";

const routesLink = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<App />}>
      <Route path="/" element={<Todos />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/rewardsSettings" element={<RewardsSettings />} />
      <Route path="/result" element={<Result />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default routesLink;
