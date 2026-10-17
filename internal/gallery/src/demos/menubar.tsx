import { For, createSignal } from "solid-js";
import { Menubar } from "soldix";
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from "../icons";

const RADIO_ITEMS = ["Andy", "Benoît", "Luis"];
const CHECK_ITEMS = ["Always Show Bookmarks Bar", "Always Show Full URLs"];

const MenubarDemo = () => {
  const [checkedSelection, setCheckedSelection] = createSignal<string[]>([CHECK_ITEMS[1]!]);
  const [radioSelection, setRadioSelection] = createSignal(RADIO_ITEMS[2]);

  return (
    <Menubar.Root class="MenubarRoot">
      <Menubar.Menu>
        <Menubar.Trigger class="MenubarTrigger">File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content class="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
            <Menubar.Item class="MenubarItem">
              New Tab <div class="RightSlot">⌘ T</div>
            </Menubar.Item>
            <Menubar.Item class="MenubarItem">
              New Window <div class="RightSlot">⌘ N</div>
            </Menubar.Item>
            <Menubar.Item class="MenubarItem" disabled>
              New Incognito Window
            </Menubar.Item>
            <Menubar.Separator class="MenubarSeparator" />
            <Menubar.Sub>
              <Menubar.SubTrigger class="MenubarSubTrigger">
                Share
                <div class="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent class="MenubarSubContent" alignOffset={-5}>
                  <Menubar.Item class="MenubarItem">Email Link</Menubar.Item>
                  <Menubar.Item class="MenubarItem">Messages</Menubar.Item>
                  <Menubar.Item class="MenubarItem">Notes</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator class="MenubarSeparator" />
            <Menubar.Item class="MenubarItem">
              Print… <div class="RightSlot">⌘ P</div>
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger class="MenubarTrigger">Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content class="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
            <Menubar.Item class="MenubarItem">
              Undo <div class="RightSlot">⌘ Z</div>
            </Menubar.Item>
            <Menubar.Item class="MenubarItem">
              Redo <div class="RightSlot">⇧ ⌘ Z</div>
            </Menubar.Item>
            <Menubar.Separator class="MenubarSeparator" />
            <Menubar.Sub>
              <Menubar.SubTrigger class="MenubarSubTrigger">
                Find
                <div class="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>

              <Menubar.Portal>
                <Menubar.SubContent class="MenubarSubContent" alignOffset={-5}>
                  <Menubar.Item class="MenubarItem">Search the web…</Menubar.Item>
                  <Menubar.Separator class="MenubarSeparator" />
                  <Menubar.Item class="MenubarItem">Find…</Menubar.Item>
                  <Menubar.Item class="MenubarItem">Find Next</Menubar.Item>
                  <Menubar.Item class="MenubarItem">Find Previous</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator class="MenubarSeparator" />
            <Menubar.Item class="MenubarItem">Cut</Menubar.Item>
            <Menubar.Item class="MenubarItem">Copy</Menubar.Item>
            <Menubar.Item class="MenubarItem">Paste</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger class="MenubarTrigger">View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content class="MenubarContent" align="start" sideOffset={5} alignOffset={-14}>
            <For each={CHECK_ITEMS}>
              {(item) => (
                <Menubar.CheckboxItem
                  class="MenubarCheckboxItem inset"
                  checked={checkedSelection().includes(item)}
                  onCheckedChange={() =>
                    setCheckedSelection((current) =>
                      current.includes(item)
                        ? current.filter((el) => el !== item)
                        : current.concat(item),
                    )
                  }
                >
                  <Menubar.ItemIndicator class="MenubarItemIndicator">
                    <CheckIcon />
                  </Menubar.ItemIndicator>
                  {item}
                </Menubar.CheckboxItem>
              )}
            </For>
            <Menubar.Separator class="MenubarSeparator" />
            <Menubar.Item class="MenubarItem inset">
              Reload <div class="RightSlot">⌘ R</div>
            </Menubar.Item>
            <Menubar.Item class="MenubarItem inset" disabled>
              Force Reload <div class="RightSlot">⇧ ⌘ R</div>
            </Menubar.Item>
            <Menubar.Separator class="MenubarSeparator" />
            <Menubar.Item class="MenubarItem inset">Toggle Fullscreen</Menubar.Item>
            <Menubar.Separator class="MenubarSeparator" />
            <Menubar.Item class="MenubarItem inset">Hide Sidebar</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger class="MenubarTrigger">Profiles</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content class="MenubarContent" align="start" sideOffset={5} alignOffset={-14}>
            <Menubar.RadioGroup value={radioSelection()} onValueChange={setRadioSelection}>
              <For each={RADIO_ITEMS}>
                {(item) => (
                  <Menubar.RadioItem class="MenubarRadioItem inset" value={item}>
                    <Menubar.ItemIndicator class="MenubarItemIndicator">
                      <DotFilledIcon />
                    </Menubar.ItemIndicator>
                    {item}
                  </Menubar.RadioItem>
                )}
              </For>
              <Menubar.Separator class="MenubarSeparator" />
              <Menubar.Item class="MenubarItem inset">Edit…</Menubar.Item>
              <Menubar.Separator class="MenubarSeparator" />
              <Menubar.Item class="MenubarItem inset">Add Profile…</Menubar.Item>
            </Menubar.RadioGroup>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
};

export default MenubarDemo;
