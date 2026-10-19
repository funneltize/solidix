import type { Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { DemoEntry } from "./demos/registry";

/**
 * Chromeless full-viewport render of a demo for `#/<slug>/full` routes.
 * Used by page-scale demos (funnel) that need real width to evaluate.
 */
const FullDemo: Component<{ demo: DemoEntry }> = (props) => (
  <main class="full-demo">
    <a class="full-demo-back" href={`#/${props.demo.slug}`}>
      <span aria-hidden="true">←</span> {props.demo.title} docs
    </a>
    <Dynamic component={props.demo.component} />
  </main>
);

export default FullDemo;
