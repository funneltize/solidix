import { Label } from "soldix";

const LabelDemo = () => (
  <div
    style={{
      display: "flex",
      padding: "0 20px",
      "flex-wrap": "wrap",
      gap: "15px",
      "align-items": "center",
    }}
  >
    <Label.Root class="LabelRoot" for="firstName">
      First name
    </Label.Root>
    <input class="Input" type="text" id="firstName" value="Pedro Duarte" />
  </div>
);

export default LabelDemo;
