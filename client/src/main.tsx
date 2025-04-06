import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import App from "./App";
import theme from "./theme";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);
