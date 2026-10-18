import { omit, type Component } from "solid-js";
import { Accordion } from "solidix";
import { ChevronDownIcon } from "../icons";

const AccordionDemo = () => (
  <Accordion.Root class="AccordionRoot" type="single" defaultValue="item-1" collapsible>
    <Accordion.Item class="AccordionItem" value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
    </Accordion.Item>

    <Accordion.Item class="AccordionItem" value="item-2">
      <AccordionTrigger>Is it unstyled?</AccordionTrigger>
      <AccordionContent>
        Yes. It&apos;s unstyled by default, giving you freedom over the look and feel.
      </AccordionContent>
    </Accordion.Item>

    <Accordion.Item class="AccordionItem" value="item-3">
      <AccordionTrigger>Can it be animated?</AccordionTrigger>
      <Accordion.Content class="AccordionContent">
        <div class="AccordionContentText">
          Yes! You can animate the Accordion with CSS or JavaScript.
        </div>
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);

const AccordionTrigger: Component<Accordion.AccordionTriggerProps> = (props) => {
  const rest = omit(props, "children", "class");
  return (
    <Accordion.Header class="AccordionHeader">
      <Accordion.Trigger class={`AccordionTrigger ${props.class ?? ""}`} {...rest}>
        {props.children}
        <ChevronDownIcon class="AccordionChevron" />
      </Accordion.Trigger>
    </Accordion.Header>
  );
};

const AccordionContent: Component<Accordion.AccordionContentProps> = (props) => {
  const rest = omit(props, "children", "class");
  return (
    <Accordion.Content class={`AccordionContent ${props.class ?? ""}`} {...rest}>
      <div class="AccordionContentText">{props.children}</div>
    </Accordion.Content>
  );
};

export default AccordionDemo;
