import { omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { NavigationMenu } from "solidix";
import { CaretDownIcon } from "../icons";

const NavigationMenuDemo = () => {
  return (
    <NavigationMenu.Root class="NavigationMenuRoot">
      <NavigationMenu.List class="NavigationMenuList">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger class="NavigationMenuTrigger">
            Primitives <CaretDownIcon class="CaretDown" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content class="NavigationMenuContent">
            <ul class="List one">
              <li style={{ "grid-row": "span 3" }}>
                <NavigationMenu.Link asChild>
                  <a class="Callout" href="#/">
                    <svg aria-hidden="true" width="38" height="38" viewBox="0 0 38 38">
                      <rect width="38" height="38" rx="9" fill="white" />
                      <rect x="21" y="21" width="12" height="12" rx="3" fill="#c2410c" />
                    </svg>
                    <div class="CalloutHeading">Solidix</div>
                    <p class="CalloutText">Unstyled, accessible primitives for Solid 2.</p>
                  </a>
                </NavigationMenu.Link>
              </li>

              <ListItem href="#/accordion" title="Accordion">
                Vertically stacked sections with keyboard navigation.
              </ListItem>
              <ListItem href="#/dialog" title="Dialog">
                Modal windows with focus trapping and announcements.
              </ListItem>
              <ListItem href="#/select" title="Select">
                Custom dropdowns with typeahead and listbox semantics.
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger class="NavigationMenuTrigger">
            Resources <CaretDownIcon class="CaretDown" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content class="NavigationMenuContent">
            <ul class="List two">
              <ListItem title="Documentation" href="#/">
                Guides and API reference for every primitive.
              </ListItem>
              <ListItem title="Releases" href="https://github.com/funneltize/solidix/releases">
                Changelog and version history.
              </ListItem>
              <ListItem title="Issues" href="https://github.com/funneltize/solidix/issues">
                Report bugs and request features.
              </ListItem>
              <ListItem title="Radix UI" href="https://www.radix-ui.com/primitives">
                The React library Solidix ports to Solid 2.
              </ListItem>
              <ListItem title="Solid" href="https://www.solidjs.com/">
                Fine-grained reactivity with no virtual DOM.
              </ListItem>
              <ListItem title="WAI-ARIA" href="https://www.w3.org/WAI/ARIA/apg/">
                Authoring practices behind the interaction patterns.
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link
            class="NavigationMenuLink"
            href="https://github.com/funneltize/solidix"
          >
            GitHub
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Indicator class="NavigationMenuIndicator">
          <div class="Arrow" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div class="ViewportPosition">
        <NavigationMenu.Viewport class="NavigationMenuViewport" />
      </div>
    </NavigationMenu.Root>
  );
};

type ListItemProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  title: string;
};

const ListItem: Component<ListItemProps> = (props) => {
  const rest = omit(props, "class", "children", "title");
  return (
    <li>
      <NavigationMenu.Link asChild>
        <a class={`ListItemLink ${props.class ?? ""}`} {...rest}>
          <div class="ListItemHeading">{props.title}</div>
          <p class="ListItemText">{props.children}</p>
        </a>
      </NavigationMenu.Link>
    </li>
  );
};

export default NavigationMenuDemo;
