import { render } from "@solidjs/web";
import "@radix-ui/themes/styles.css";
import "./site.css";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Gallery: missing #root element");
render(() => <App />, root);
