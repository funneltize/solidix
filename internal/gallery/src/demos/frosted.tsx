import { Frosted } from "solidix";

const FrostedDemo = () => (
  <Frosted.Theme>
    <div class="FrostedDemo">
      <Frosted.Heading size="6">Wave 1: type and layout</Frosted.Heading>
      <Frosted.Text size="3" color="gray">
        Presentational primitives ported from frosted-ui, styled by{" "}
        <Frosted.Code size="2">fui-*</Frosted.Code> classes under the Theme root.
      </Frosted.Text>
      <Frosted.Separator size="2" />
      <Frosted.Heading size="4">Inline type</Frosted.Heading>
      <Frosted.Text size="3">
        This is <Frosted.Em>emphasized</Frosted.Em> text, a{" "}
        <Frosted.Quote>short quote</Frosted.Quote>, a{" "}
        <Frosted.Link href="https://www.radix-ui.com" underline="always">
          link
        </Frosted.Link>
        , and a <Frosted.Kbd size="2">⌘ K</Frosted.Kbd> shortcut.
      </Frosted.Text>
      <Frosted.Blockquote size="3">
        Frosted-ui is a small, themeable React component library. Solidix ports it to Solid.
      </Frosted.Blockquote>
      <Frosted.Separator size="2" orientation="horizontal" decorative />
      <Frosted.Heading size="4">Layout and feedback</Frosted.Heading>
      <Frosted.Inset side="x" clip="padding-box">
        <Frosted.Text size="2" color="gray">
          Inset content bleeds to the padded edges of its container.
        </Frosted.Text>
      </Frosted.Inset>
      <div class="FrostedDemoRow">
        <Frosted.SkeletonAvatar size="4" shape="circle" />
        <div class="FrostedDemoStack">
          <Frosted.SkeletonText size="3" />
          <Frosted.SkeletonRect />
        </div>
        <Frosted.Spinner size="3" />
      </div>
      <Frosted.Separator size="2" />
      <Frosted.Heading size="6">Wave 2: form controls</Frosted.Heading>
      <Frosted.Form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Frosted.Fieldset.Root>
          <Frosted.Fieldset.Legend>Profile</Frosted.Fieldset.Legend>
          <Frosted.Field.Root>
            <Frosted.Field.Label>Name</Frosted.Field.Label>
            <Frosted.Field.Control placeholder="Ada Lovelace" />
            <Frosted.Field.Description>Shown on your public profile.</Frosted.Field.Description>
          </Frosted.Field.Root>
          <Frosted.Field.Root>
            <Frosted.Field.Label>Bio</Frosted.Field.Label>
            <Frosted.Field.Control placeholder="A sentence or two" />
          </Frosted.Field.Root>
        </Frosted.Fieldset.Root>
        <div class="FrostedDemoRow">
          <Frosted.TextField.Root>
            <Frosted.TextField.Input placeholder="Email address" />
          </Frosted.TextField.Root>
          <Frosted.NumberField.Root defaultValue={2} min={1} max={10}>
            <Frosted.NumberField.Input aria-label="Seats" />
          </Frosted.NumberField.Root>
        </div>
        <Frosted.TextArea placeholder="Notes for the team" rows={3} />
        <div class="FrostedDemoRow">
          <Frosted.Checkbox defaultChecked>Subscribe</Frosted.Checkbox>
          <Frosted.Switch aria-label="Notifications" defaultChecked />
          <Frosted.RadioGroup.Root defaultValue="one" orientation="horizontal">
            <Frosted.RadioGroup.Item value="one">One</Frosted.RadioGroup.Item>
            <Frosted.RadioGroup.Item value="two">Two</Frosted.RadioGroup.Item>
          </Frosted.RadioGroup.Root>
        </div>
        <Frosted.RadioButtonGroup.Root defaultValue="card">
          <Frosted.RadioButtonGroup.Item value="card">Card</Frosted.RadioButtonGroup.Item>
          <Frosted.RadioButtonGroup.Item value="cash">Cash</Frosted.RadioButtonGroup.Item>
        </Frosted.RadioButtonGroup.Root>
        <Frosted.Slider aria-label="Volume" defaultValue={[30]} />
        <Frosted.Select.Root>
          <Frosted.Select.Trigger placeholder="Pick a fruit" />
          <Frosted.Select.Content>
            <Frosted.Select.Item value="apple">Apple</Frosted.Select.Item>
            <Frosted.Select.Item value="banana">Banana</Frosted.Select.Item>
          </Frosted.Select.Content>
        </Frosted.Select.Root>
        <Frosted.OTPFieldRoot>
          <Frosted.OTPFieldGroup>
            <Frosted.OTPFieldSlot aria-label="Digit 1" />
            <Frosted.OTPFieldSlot aria-label="Digit 2" />
            <Frosted.OTPFieldSeparator />
            <Frosted.OTPFieldSlot aria-label="Digit 3" />
            <Frosted.OTPFieldSlot aria-label="Digit 4" />
          </Frosted.OTPFieldGroup>
          <Frosted.OTPFieldHiddenInput />
        </Frosted.OTPFieldRoot>
        <div class="FrostedDemoRow">
          <Frosted.Button type="submit">Save</Frosted.Button>
          <Frosted.IconButton aria-label="More options" variant="ghost">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
            </svg>
          </Frosted.IconButton>
        </div>
      </Frosted.Form>
      <Frosted.Separator size="2" />
      <Frosted.Heading size="6">Wave 3: overlays</Frosted.Heading>
      <div class="FrostedDemoRow">
        <Frosted.Dialog.Root>
          <Frosted.Dialog.Trigger>
            <Frosted.Button variant="surface">Open dialog</Frosted.Button>
          </Frosted.Dialog.Trigger>
          <Frosted.Dialog.Content>
            <Frosted.Dialog.Title>Settings</Frosted.Dialog.Title>
            <Frosted.Dialog.Description>Adjust your preferences.</Frosted.Dialog.Description>
            <Frosted.Dialog.Close>
              <Frosted.Button>Done</Frosted.Button>
            </Frosted.Dialog.Close>
          </Frosted.Dialog.Content>
        </Frosted.Dialog.Root>
        <Frosted.AlertDialog.Root>
          <Frosted.AlertDialog.Trigger>
            <Frosted.Button variant="surface">Delete</Frosted.Button>
          </Frosted.AlertDialog.Trigger>
          <Frosted.AlertDialog.Content>
            <Frosted.AlertDialog.Title>Are you sure?</Frosted.AlertDialog.Title>
            <Frosted.AlertDialog.Description>
              This action cannot be undone.
            </Frosted.AlertDialog.Description>
            <Frosted.AlertDialog.Cancel>
              <Frosted.Button variant="soft">Cancel</Frosted.Button>
            </Frosted.AlertDialog.Cancel>
            <Frosted.AlertDialog.Action>
              <Frosted.Button>Confirm</Frosted.Button>
            </Frosted.AlertDialog.Action>
          </Frosted.AlertDialog.Content>
        </Frosted.AlertDialog.Root>
        <Frosted.Drawer.Root>
          <Frosted.Drawer.Trigger>
            <Frosted.Button variant="surface">Open drawer</Frosted.Button>
          </Frosted.Drawer.Trigger>
          <Frosted.Drawer.Content>
            <Frosted.Drawer.Header>
              <Frosted.Drawer.Title>Panel</Frosted.Drawer.Title>
            </Frosted.Drawer.Header>
            <Frosted.Drawer.Body>
              <Frosted.Text size="2">Drawer body content.</Frosted.Text>
            </Frosted.Drawer.Body>
            <Frosted.Drawer.Close>
              <Frosted.Button variant="soft">Close</Frosted.Button>
            </Frosted.Drawer.Close>
          </Frosted.Drawer.Content>
        </Frosted.Drawer.Root>
        <Frosted.Popover.Root>
          <Frosted.Popover.Trigger>
            <Frosted.Button variant="surface">Popover</Frosted.Button>
          </Frosted.Popover.Trigger>
          <Frosted.Popover.Content>
            <Frosted.Text size="2">Pinned to the trigger.</Frosted.Text>
          </Frosted.Popover.Content>
        </Frosted.Popover.Root>
      </div>
      <Frosted.TooltipProvider>
        <div class="FrostedDemoRow">
          <Frosted.Tooltip content="Helpful hint">
            <Frosted.Button variant="ghost">Hover me</Frosted.Button>
          </Frosted.Tooltip>
          <Frosted.HoverCard.Root>
            <Frosted.HoverCard.Trigger>
              <Frosted.Link href="#">Hover card</Frosted.Link>
            </Frosted.HoverCard.Trigger>
            <Frosted.HoverCard.Content>
              <Frosted.Text size="2">Preview content.</Frosted.Text>
            </Frosted.HoverCard.Content>
          </Frosted.HoverCard.Root>
          <Frosted.DropdownMenu.Root>
            <Frosted.DropdownMenu.Trigger>
              <Frosted.Button variant="surface">Menu</Frosted.Button>
            </Frosted.DropdownMenu.Trigger>
            <Frosted.DropdownMenu.Content>
              <Frosted.DropdownMenu.Item>Edit</Frosted.DropdownMenu.Item>
              <Frosted.DropdownMenu.Item>Duplicate</Frosted.DropdownMenu.Item>
            </Frosted.DropdownMenu.Content>
          </Frosted.DropdownMenu.Root>
          <Frosted.ContextMenu.Root>
            <Frosted.ContextMenu.Trigger>
              <Frosted.Button variant="surface">Right-click me</Frosted.Button>
            </Frosted.ContextMenu.Trigger>
            <Frosted.ContextMenu.Content>
              <Frosted.ContextMenu.Item>Cut</Frosted.ContextMenu.Item>
              <Frosted.ContextMenu.Item>Copy</Frosted.ContextMenu.Item>
            </Frosted.ContextMenu.Content>
          </Frosted.ContextMenu.Root>
          <Frosted.Lightbox.Root>
            <Frosted.Lightbox.Trigger index={0}>
              <Frosted.Button variant="surface">Gallery</Frosted.Button>
            </Frosted.Lightbox.Trigger>
            <Frosted.Lightbox.Content aria-label="Demo gallery">
              <Frosted.Lightbox.ItemGroup>
                <Frosted.Lightbox.Item index={0} caption="First slide">
                  <div class="FrostedDemoSlide">Slide one</div>
                </Frosted.Lightbox.Item>
                <Frosted.Lightbox.Item index={1} caption="Second slide">
                  <div class="FrostedDemoSlide">Slide two</div>
                </Frosted.Lightbox.Item>
              </Frosted.Lightbox.ItemGroup>
              <Frosted.Lightbox.Counter />
              <Frosted.Lightbox.Caption />
              <Frosted.Lightbox.Previous>
                <Frosted.Button variant="soft">Previous</Frosted.Button>
              </Frosted.Lightbox.Previous>
              <Frosted.Lightbox.Next>
                <Frosted.Button variant="soft">Next</Frosted.Button>
              </Frosted.Lightbox.Next>
              <Frosted.Lightbox.Close>
                <Frosted.Button variant="soft">Close</Frosted.Button>
              </Frosted.Lightbox.Close>
            </Frosted.Lightbox.Content>
          </Frosted.Lightbox.Root>
        </div>
      </Frosted.TooltipProvider>
      <Frosted.Separator size="2" />
      <Frosted.Heading size="6">Wave 4: navigation and data</Frosted.Heading>
      <Frosted.Heading size="4">Card, badge, and callout</Frosted.Heading>
      <Frosted.Card size="2">
        <Frosted.Heading size="3">
          Release notes <Frosted.Badge color="green">New</Frosted.Badge>
        </Frosted.Heading>
        <Frosted.Text size="2" color="gray">
          Wave 4 ports navigation and data display components.
        </Frosted.Text>
      </Frosted.Card>
      <Frosted.Callout.Root>
        <Frosted.Callout.Icon>!</Frosted.Callout.Icon>
        <div>
          <Frosted.Callout.Title>Heads up</Frosted.Callout.Title>
          <Frosted.Callout.Description>
            Callouts pair an icon with a title and supporting text.
          </Frosted.Callout.Description>
        </div>
      </Frosted.Callout.Root>
      <Frosted.Heading size="4">Breadcrumbs</Frosted.Heading>
      <Frosted.Breadcrumbs.Root>
        <Frosted.Breadcrumbs.Item onClick={() => {}}>Home</Frosted.Breadcrumbs.Item>
        <Frosted.Breadcrumbs.Item onClick={() => {}}>Library</Frosted.Breadcrumbs.Item>
        <Frosted.Breadcrumbs.Item>Data</Frosted.Breadcrumbs.Item>
      </Frosted.Breadcrumbs.Root>
      <Frosted.Heading size="4">Data list and table</Frosted.Heading>
      <Frosted.DataList.Root>
        <Frosted.DataList.Item>
          <Frosted.DataList.Label>Name</Frosted.DataList.Label>
          <Frosted.DataList.Value>Ada Lovelace</Frosted.DataList.Value>
        </Frosted.DataList.Item>
        <Frosted.DataList.Item>
          <Frosted.DataList.Label>Role</Frosted.DataList.Label>
          <Frosted.DataList.Value>Analyst</Frosted.DataList.Value>
        </Frosted.DataList.Item>
      </Frosted.DataList.Root>
      <Frosted.Table.Root>
        <Frosted.Table.Table>
          <Frosted.Table.Header>
            <Frosted.Table.Row>
              <Frosted.Table.ColumnHeaderCell>Name</Frosted.Table.ColumnHeaderCell>
              <Frosted.Table.ColumnHeaderCell>Role</Frosted.Table.ColumnHeaderCell>
            </Frosted.Table.Row>
          </Frosted.Table.Header>
          <Frosted.Table.Body>
            <Frosted.Table.Row>
              <Frosted.Table.RowHeader>Ada</Frosted.Table.RowHeader>
              <Frosted.Table.Cell>Analyst</Frosted.Table.Cell>
            </Frosted.Table.Row>
            <Frosted.Table.Row>
              <Frosted.Table.RowHeader>Grace</Frosted.Table.RowHeader>
              <Frosted.Table.Cell>Engineer</Frosted.Table.Cell>
            </Frosted.Table.Row>
          </Frosted.Table.Body>
        </Frosted.Table.Table>
      </Frosted.Table.Root>
      <Frosted.Heading size="4">Progress</Frosted.Heading>
      <div class="FrostedDemoRow">
        <Frosted.Progress value={60} max={100} aria-label="Upload progress" />
        <Frosted.CircularProgress value={75} max={100} aria-label="Sync progress" />
      </div>
      <Frosted.Heading size="4">Avatars</Frosted.Heading>
      <div class="FrostedDemoRow">
        <Frosted.Avatar fallback="AL" />
        <Frosted.AvatarGroup.Root>
          <Frosted.AvatarGroup.Avatar fallback="AL" />
          <Frosted.AvatarGroup.Avatar fallback="GH" />
        </Frosted.AvatarGroup.Root>
        <Frosted.AvatarStack.Root>
          <Frosted.AvatarStack.Avatar fallback="AL" />
          <Frosted.AvatarStack.Avatar fallback="GH" />
        </Frosted.AvatarStack.Root>
      </div>
      <Frosted.Heading size="4">Tabs and segmented controls</Frosted.Heading>
      <Frosted.Tabs.Root defaultValue="one">
        <Frosted.Tabs.List>
          <Frosted.Tabs.Trigger value="one">One</Frosted.Tabs.Trigger>
          <Frosted.Tabs.Trigger value="two">Two</Frosted.Tabs.Trigger>
        </Frosted.Tabs.List>
        <Frosted.Tabs.Content value="one">
          <Frosted.Text size="2">First panel.</Frosted.Text>
        </Frosted.Tabs.Content>
        <Frosted.Tabs.Content value="two">
          <Frosted.Text size="2">Second panel.</Frosted.Text>
        </Frosted.Tabs.Content>
      </Frosted.Tabs.Root>
      <Frosted.TabsNav.Root>
        <Frosted.TabsNav.Link href="#" active>
          Current
        </Frosted.TabsNav.Link>
        <Frosted.TabsNav.Link href="#">Archive</Frosted.TabsNav.Link>
      </Frosted.TabsNav.Root>
      <Frosted.SegmentedControl.Root defaultValue="day">
        <Frosted.SegmentedControl.List>
          <Frosted.SegmentedControl.Trigger value="day">Day</Frosted.SegmentedControl.Trigger>
          <Frosted.SegmentedControl.Trigger value="week">Week</Frosted.SegmentedControl.Trigger>
        </Frosted.SegmentedControl.List>
      </Frosted.SegmentedControl.Root>
      <Frosted.Heading size="4">Scroll area</Frosted.Heading>
      <Frosted.ScrollArea style={{ height: "120px" }}>
        <Frosted.Text size="2">
          Scrollable content with themed scrollbars. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Frosted.Text>
      </Frosted.ScrollArea>
      <Frosted.Heading size="4">Scroll gallery</Frosted.Heading>
      <Frosted.ScrollGallery.Root>
        <Frosted.ScrollGallery.Previous>Previous</Frosted.ScrollGallery.Previous>
        <Frosted.ScrollGallery.Viewport style={{ display: "flex", "overflow-x": "auto" }}>
          <Frosted.ScrollGallery.Item style={{ "min-width": "100%" }}>
            <div class="FrostedDemoSlide">Slide one</div>
          </Frosted.ScrollGallery.Item>
          <Frosted.ScrollGallery.Item style={{ "min-width": "100%" }}>
            <div class="FrostedDemoSlide">Slide two</div>
          </Frosted.ScrollGallery.Item>
        </Frosted.ScrollGallery.Viewport>
        <Frosted.ScrollGallery.Next>Next</Frosted.ScrollGallery.Next>
        <Frosted.ScrollGallery.ScrollMarkerGroup>
          <Frosted.ScrollGallery.ScrollMarker index={0} aria-label="Go to slide one" />
          <Frosted.ScrollGallery.ScrollMarker index={1} aria-label="Go to slide two" />
        </Frosted.ScrollGallery.ScrollMarkerGroup>
      </Frosted.ScrollGallery.Root>
      <Frosted.Separator size="2" />
      <Frosted.Heading size="6">Wave 5: complex and remainder</Frosted.Heading>
      <Frosted.Heading size="4">Strong, shine, and empty state</Frosted.Heading>
      <Frosted.Text size="2">
        Wave 5 in <Frosted.Strong>bold</Frosted.Strong>.
      </Frosted.Text>
      <Frosted.Shine>
        <Frosted.Badge color="amber">Move the pointer over me</Frosted.Badge>
      </Frosted.Shine>
      <Frosted.EmptyState.Root>
        <Frosted.EmptyState.Header>
          <Frosted.EmptyState.Media>?</Frosted.EmptyState.Media>
          <Frosted.EmptyState.Title>No results</Frosted.EmptyState.Title>
          <Frosted.EmptyState.Description>
            Nothing matches this demo query.
          </Frosted.EmptyState.Description>
        </Frosted.EmptyState.Header>
        <Frosted.EmptyState.Actions>
          <Frosted.Button variant="soft">Clear</Frosted.Button>
        </Frosted.EmptyState.Actions>
      </Frosted.EmptyState.Root>
      <Frosted.Heading size="4">Filter chips and flags</Frosted.Heading>
      <div class="FrostedDemoRow">
        <Frosted.FilterChip defaultChecked>Active</Frosted.FilterChip>
        <Frosted.FilterChip>Archived</Frosted.FilterChip>
        <Frosted.CountryFlag countryCode="DE" />
        <Frosted.CountryFlag countryCode="JP" size="3" />
      </div>
      <Frosted.Heading size="4">Stacked bar chart</Frosted.Heading>
      <Frosted.StackedHorizontalBarChart
        data={[
          { label: "Apples", value: 25, color: "red" },
          { label: "Bananas", value: 75, color: "yellow" },
        ]}
      />
      <Frosted.Heading size="4">Widget stack</Frosted.Heading>
      <Frosted.WidgetStack.Root>
        <Frosted.WidgetStack.Prev>Previous</Frosted.WidgetStack.Prev>
        <Frosted.WidgetStack.Stack>
          <Frosted.WidgetStack.Item>Widget one</Frosted.WidgetStack.Item>
          <Frosted.WidgetStack.Item>Widget two</Frosted.WidgetStack.Item>
        </Frosted.WidgetStack.Stack>
        <Frosted.WidgetStack.Next>Next</Frosted.WidgetStack.Next>
      </Frosted.WidgetStack.Root>
      <Frosted.Heading size="4">Accordion</Frosted.Heading>
      <Frosted.Accordion.Root>
        <Frosted.Accordion.Item value="one">
          <Frosted.Accordion.Trigger>First</Frosted.Accordion.Trigger>
          <Frosted.Accordion.Content>First panel.</Frosted.Accordion.Content>
        </Frosted.Accordion.Item>
        <Frosted.Accordion.Item value="two">
          <Frosted.Accordion.Trigger>Second</Frosted.Accordion.Trigger>
          <Frosted.Accordion.Content>Second panel.</Frosted.Accordion.Content>
        </Frosted.Accordion.Item>
      </Frosted.Accordion.Root>
      <Frosted.Heading size="4">Credit card</Frosted.Heading>
      <Frosted.CreditCard.Root>
        <Frosted.CreditCard.Content color="blue">
          <Frosted.CreditCard.Front>
            <Frosted.CreditCard.FrontHeader>
              <Frosted.CreditCard.Brand>Demo Bank</Frosted.CreditCard.Brand>
              <Frosted.CreditCard.BrandLogo brand="visa" />
            </Frosted.CreditCard.FrontHeader>
            <Frosted.CreditCard.Title>Demo card</Frosted.CreditCard.Title>
            <Frosted.CreditCard.LastFour>4242</Frosted.CreditCard.LastFour>
          </Frosted.CreditCard.Front>
          <Frosted.CreditCard.Back>
            <Frosted.CreditCard.BackContent>
              <Frosted.CreditCard.MagStripe />
            </Frosted.CreditCard.BackContent>
          </Frosted.CreditCard.Back>
        </Frosted.CreditCard.Content>
        <Frosted.CreditCard.Trigger>Flip</Frosted.CreditCard.Trigger>
        <Frosted.CreditCard.Fieldset>
          <Frosted.CreditCard.Field>
            <Frosted.CreditCard.FieldLabel>Card number</Frosted.CreditCard.FieldLabel>
            <Frosted.CreditCard.NumberField aria-label="Card number" />
          </Frosted.CreditCard.Field>
          <Frosted.CreditCard.FieldGroup>
            <Frosted.CreditCard.Field>
              <Frosted.CreditCard.FieldLabel>Expiry</Frosted.CreditCard.FieldLabel>
              <Frosted.CreditCard.ExpiryField aria-label="Expiry" />
            </Frosted.CreditCard.Field>
            <Frosted.CreditCard.Field>
              <Frosted.CreditCard.FieldLabel>CVV</Frosted.CreditCard.FieldLabel>
              <Frosted.CreditCard.CVVField aria-label="CVV" />
            </Frosted.CreditCard.Field>
          </Frosted.CreditCard.FieldGroup>
        </Frosted.CreditCard.Fieldset>
      </Frosted.CreditCard.Root>
      <Frosted.Heading size="4">Bot avatars</Frosted.Heading>
      <div class="FrostedDemoRow">
        <Frosted.BotAvatar expression="happy" />
        <Frosted.BotAvatar status="thinking" />
        <Frosted.BotAvatar identity="demo-bot" notification />
      </div>
      <Frosted.Heading size="4">Portal and visually hidden</Frosted.Heading>
      <Frosted.Text size="2">The line below this demo is portaled to the body end.</Frosted.Text>
      <Frosted.Portal>
        <Frosted.Text size="2">Portaled content (end of body).</Frosted.Text>
      </Frosted.Portal>
      <Frosted.VisuallyHidden>Screen-reader-only demo label.</Frosted.VisuallyHidden>
    </div>
  </Frosted.Theme>
);

export default FrostedDemo;
