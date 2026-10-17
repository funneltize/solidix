import { createSignal } from "solid-js";
import { ContextMenu } from "soldix";
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from "../icons";

const ContextMenuDemo = () => {
  const [bookmarksChecked, setBookmarksChecked] = createSignal(true);
  const [urlsChecked, setUrlsChecked] = createSignal(false);
  const [person, setPerson] = createSignal("pedro");

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger class="ContextMenuTrigger">Right-click here.</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content class="ContextMenuContent" sideOffset={5} align="end">
          <ContextMenu.Item class="ContextMenuItem">
            Back <div class="RightSlot">⌘+[</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="ContextMenuItem" disabled>
            Forward <div class="RightSlot">⌘+]</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="ContextMenuItem">
            Reload <div class="RightSlot">⌘+R</div>
          </ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger class="ContextMenuSubTrigger">
              More Tools
              <div class="RightSlot">
                <ChevronRightIcon />
              </div>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent class="ContextMenuSubContent" sideOffset={2} alignOffset={-5}>
                <ContextMenu.Item class="ContextMenuItem">
                  Save Page As… <div class="RightSlot">⌘+S</div>
                </ContextMenu.Item>
                <ContextMenu.Item class="ContextMenuItem">Create Shortcut…</ContextMenu.Item>
                <ContextMenu.Item class="ContextMenuItem">Name Window…</ContextMenu.Item>
                <ContextMenu.Separator class="ContextMenuSeparator" />
                <ContextMenu.Item class="ContextMenuItem">Developer Tools</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator class="ContextMenuSeparator" />

          <ContextMenu.CheckboxItem
            class="ContextMenuCheckboxItem"
            checked={bookmarksChecked()}
            onCheckedChange={setBookmarksChecked}
          >
            <ContextMenu.ItemIndicator class="ContextMenuItemIndicator">
              <CheckIcon />
            </ContextMenu.ItemIndicator>
            Show Bookmarks <div class="RightSlot">⌘+B</div>
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem
            class="ContextMenuCheckboxItem"
            checked={urlsChecked()}
            onCheckedChange={setUrlsChecked}
          >
            <ContextMenu.ItemIndicator class="ContextMenuItemIndicator">
              <CheckIcon />
            </ContextMenu.ItemIndicator>
            Show Full URLs
          </ContextMenu.CheckboxItem>

          <ContextMenu.Separator class="ContextMenuSeparator" />

          <ContextMenu.Label class="ContextMenuLabel">People</ContextMenu.Label>
          <ContextMenu.RadioGroup value={person()} onValueChange={setPerson}>
            <ContextMenu.RadioItem class="ContextMenuRadioItem" value="pedro">
              <ContextMenu.ItemIndicator class="ContextMenuItemIndicator">
                <DotFilledIcon />
              </ContextMenu.ItemIndicator>
              Pedro Duarte
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem class="ContextMenuRadioItem" value="colm">
              <ContextMenu.ItemIndicator class="ContextMenuItemIndicator">
                <DotFilledIcon />
              </ContextMenu.ItemIndicator>
              Colm Tuite
            </ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default ContextMenuDemo;
