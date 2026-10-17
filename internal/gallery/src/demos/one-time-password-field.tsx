import { OneTimePasswordField } from "soldix";

const OneTimePasswordFieldDemo = () => (
  <OneTimePasswordField.Root class="OTPRoot">
    <OneTimePasswordField.Input class="OTPInput" />
    <OneTimePasswordField.Input class="OTPInput" />
    <OneTimePasswordField.Input class="OTPInput" />
    <OneTimePasswordField.Input class="OTPInput" />
    <OneTimePasswordField.Input class="OTPInput" />
    <OneTimePasswordField.Input class="OTPInput" />
    <OneTimePasswordField.HiddenInput />
  </OneTimePasswordField.Root>
);

export default OneTimePasswordFieldDemo;
