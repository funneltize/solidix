import { Tabs } from "soldix";

const TabsDemo = () => (
  <Tabs.Root class="TabsRoot" defaultValue="tab1">
    <Tabs.List class="TabsList" aria-label="Manage your account">
      <Tabs.Trigger class="TabsTrigger" value="tab1">
        Account
      </Tabs.Trigger>
      <Tabs.Trigger class="TabsTrigger" value="tab2">
        Password
      </Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content class="TabsContent" value="tab1">
      <p class="Text">Make changes to your account here. Click save when you&apos;re done.</p>
      <fieldset class="Fieldset">
        <label class="Label" for="name">
          Name
        </label>
        <input class="Input" id="name" value="Pedro Duarte" />
      </fieldset>
      <fieldset class="Fieldset">
        <label class="Label" for="username">
          Username
        </label>
        <input class="Input" id="username" value="@peduarte" />
      </fieldset>
      <div style={{ display: "flex", "margin-top": "20px", "justify-content": "flex-end" }}>
        <button class="Button green" type="button">
          Save changes
        </button>
      </div>
    </Tabs.Content>
    <Tabs.Content class="TabsContent" value="tab2">
      <p class="Text">Change your password here. After saving, you&apos;ll be logged out.</p>
      <fieldset class="Fieldset">
        <label class="Label" for="currentPassword">
          Current password
        </label>
        <input class="Input" id="currentPassword" type="password" />
      </fieldset>
      <fieldset class="Fieldset">
        <label class="Label" for="newPassword">
          New password
        </label>
        <input class="Input" id="newPassword" type="password" />
      </fieldset>
      <fieldset class="Fieldset">
        <label class="Label" for="confirmPassword">
          Confirm password
        </label>
        <input class="Input" id="confirmPassword" type="password" />
      </fieldset>
      <div style={{ display: "flex", "margin-top": "20px", "justify-content": "flex-end" }}>
        <button class="Button green" type="button">
          Change password
        </button>
      </div>
    </Tabs.Content>
  </Tabs.Root>
);

export default TabsDemo;
