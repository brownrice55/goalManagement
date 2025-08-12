import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "react-router-dom";
import routesLink from "./routes/routesLink";
import { HelmetProvider } from "react-helmet-async";
import { DataProvider } from "./contexts/DataProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataProvider>
      <HelmetProvider>
        <RouterProvider router={routesLink} />
      </HelmetProvider>
    </DataProvider>
  </StrictMode>
);
