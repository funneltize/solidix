import { PasswordToggleField } from "solidix";
import { EyeClosedIcon, EyeOpenIcon } from "../icons";

const PasswordToggleFieldDemo = () => (
  <PasswordToggleField.Root>
    <div class="Root">
      <PasswordToggleField.Input class="Input" />
      <PasswordToggleField.Toggle class="Toggle">
        <PasswordToggleField.Icon visible={<EyeOpenIcon />} hidden={<EyeClosedIcon />} />
      </PasswordToggleField.Toggle>
    </div>
  </PasswordToggleField.Root>
);

export default PasswordToggleFieldDemo;
