import { RadioGroup } from "soldix";

const RadioGroupDemo = () => (
  <form>
    <RadioGroup.Root class="RadioGroupRoot" defaultValue="default" aria-label="View density">
      <div style={{ display: "flex", "align-items": "center" }}>
        <RadioGroup.Item class="RadioGroupItem" value="default" id="r1">
          <RadioGroup.Indicator class="RadioGroupIndicator" />
        </RadioGroup.Item>
        <label class="Label" for="r1">
          Default
        </label>
      </div>
      <div style={{ display: "flex", "align-items": "center" }}>
        <RadioGroup.Item class="RadioGroupItem" value="comfortable" id="r2">
          <RadioGroup.Indicator class="RadioGroupIndicator" />
        </RadioGroup.Item>
        <label class="Label" for="r2">
          Comfortable
        </label>
      </div>
      <div style={{ display: "flex", "align-items": "center" }}>
        <RadioGroup.Item class="RadioGroupItem" value="compact" id="r3">
          <RadioGroup.Indicator class="RadioGroupIndicator" />
        </RadioGroup.Item>
        <label class="Label" for="r3">
          Compact
        </label>
      </div>
    </RadioGroup.Root>
  </form>
);

export default RadioGroupDemo;
