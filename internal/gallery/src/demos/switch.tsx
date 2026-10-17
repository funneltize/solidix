import { Switch } from "soldix";

const SwitchDemo = () => (
  <form>
    <div style={{ display: "flex", "align-items": "center" }}>
      <label
        id="airplane-mode-label"
        for="airplane-mode"
        class="Label"
        style={{ "padding-right": "15px" }}
      >
        Airplane mode
      </label>
      <Switch.Root id="airplane-mode" aria-labelledby="airplane-mode-label" class="SwitchRoot">
        <Switch.Thumb class="SwitchThumb" />
      </Switch.Root>
    </div>
  </form>
);

export default SwitchDemo;
