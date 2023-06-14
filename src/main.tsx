import "./index.scss";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./app/Theme";

import App from "./app/App.tsx";

async function main() {
  const root = createRoot(document.getElementById("root") as HTMLElement);

  root.render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}

main();
