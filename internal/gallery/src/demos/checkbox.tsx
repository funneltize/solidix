import { Checkbox } from "soldix";
import { CheckIcon } from "../icons";

const CheckboxDemo = () => (
  <form>
    <div style={{ display: "flex", "align-items": "center" }}>
      <Checkbox.Root class="CheckboxRoot" defaultChecked id="c1">
        <Checkbox.Indicator class="CheckboxIndicator">
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label class="Label" for="c1">
        Accept terms and conditions.
      </label>
    </div>
  </form>
);

export default CheckboxDemo;
