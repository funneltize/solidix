import { Separator } from "solidix";

const SeparatorDemo = () => (
  <div style={{ width: "100%", "max-width": "300px", margin: "0 15px" }}>
    <div class="Text" style={{ "font-weight": 500 }}>
      Radix Primitives
    </div>
    <div class="Text">An open-source UI component library.</div>
    <Separator.Root class="SeparatorRoot" style={{ margin: "15px 0" }} />
    <div style={{ display: "flex", height: "20px", "align-items": "center" }}>
      <div class="Text">Blog</div>
      <Separator.Root
        class="SeparatorRoot"
        decorative
        orientation="vertical"
        style={{ margin: "0 15px" }}
      />
      <div class="Text">Docs</div>
      <Separator.Root
        class="SeparatorRoot"
        decorative
        orientation="vertical"
        style={{ margin: "0 15px" }}
      />
      <div class="Text">Source</div>
    </div>
  </div>
);

export default SeparatorDemo;
