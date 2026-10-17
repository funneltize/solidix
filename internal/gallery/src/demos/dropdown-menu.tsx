import { createSignal } from "solid-js";
import { DropdownMenu } from "soldix";
import { CheckIcon, ChevronRightIcon, DotFilledIcon, HamburgerMenuIcon } from "../icons";

const DropdownMenuDemo = () => {
  const [bookmarksChecked, setBookmarksChecked] = createSignal(true);
  const [urlsChecked, setUrlsChecked] = createSignal(false);
  const [person, setPerson] = createSignal("pedro");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button class="IconButton" type="button" aria-label="Customise options">
          <HamburgerMenuIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content class="DropdownMenuContent" sideOffset={5}>
          <DropdownMenu.Item class="DropdownMenuItem">
            New Tab <div class="RightSlot">⌘+T</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="DropdownMenuItem">
            New Window <div class="RightSlot">⌘+N</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="DropdownMenuItem" disabled>
            New Private Window <div class="RightSlot">⇧+⌘+N</div>
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger class="DropdownMenuSubTrigger">
              More Tools
              <div class="RightSlot">
                <ChevronRightIcon />
              </div>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                class="DropdownMenuSubContent"
                sideOffset={2}
                alignOffset={-5}
              >
                <DropdownMenu.Item class="DropdownMenuItem">
                  Save Page As… <div class="RightSlot">⌘+S</div>
                </DropdownMenu.Item>
                <DropdownMenu.Item class="DropdownMenuItem">Create Shortcut…</DropdownMenu.Item>
                <DropdownMenu.Item class="DropdownMenuItem">Name Window…</DropdownMenu.Item>
                <DropdownMenu.Separator class="DropdownMenuSeparator" />
                <DropdownMenu.Item class="DropdownMenuItem">Developer Tools</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator class="DropdownMenuSeparator" />

          <DropdownMenu.CheckboxItem
            class="DropdownMenuCheckboxItem"
            checked={bookmarksChecked()}
            onCheckedChange={setBookmarksChecked}
          >
            <DropdownMenu.ItemIndicator class="DropdownMenuItemIndicator">
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
            Show Bookmarks <div class="RightSlot">⌘+B</div>
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            class="DropdownMenuCheckboxItem"
            checked={urlsChecked()}
            onCheckedChange={setUrlsChecked}
          >
            <DropdownMenu.ItemIndicator class="DropdownMenuItemIndicator">
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
            Show Full URLs
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.Separator class="DropdownMenuSeparator" />

          <DropdownMenu.Label class="DropdownMenuLabel">People</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={person()} onValueChange={setPerson}>
            <DropdownMenu.RadioItem class="DropdownMenuRadioItem" value="pedro">
              <DropdownMenu.ItemIndicator class="DropdownMenuItemIndicator">
                <DotFilledIcon />
              </DropdownMenu.ItemIndicator>
              Pedro Duarte
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem class="DropdownMenuRadioItem" value="colm">
              <DropdownMenu.ItemIndicator class="DropdownMenuItemIndicator">
                <DotFilledIcon />
              </DropdownMenu.ItemIndicator>
              Colm Tuite
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>

          <DropdownMenu.Arrow class="DropdownMenuArrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default DropdownMenuDemo;
