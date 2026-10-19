import type { PrimitiveDoc } from "./types";
import { doc as accordion } from "./accordion";
import { doc as alertDialog } from "./alert-dialog";
import { doc as announce } from "./announce";
import { doc as aspectRatio } from "./aspect-ratio";
import { doc as avatar } from "./avatar";
import { doc as checkbox } from "./checkbox";
import { doc as collapsible } from "./collapsible";
import { doc as contextMenu } from "./context-menu";
import { doc as dialog } from "./dialog";
import { doc as dropdownMenu } from "./dropdown-menu";
import { doc as form } from "./form";
import { doc as funnel } from "./funnel";
import { doc as hoverCard } from "./hover-card";
import { doc as label } from "./label";
import { doc as menubar } from "./menubar";
import { doc as motion } from "./motion";
import { doc as navigationMenu } from "./navigation-menu";
import { doc as oneTimePasswordField } from "./one-time-password-field";
import { doc as passwordToggleField } from "./password-toggle-field";
import { doc as popover } from "./popover";
import { doc as progress } from "./progress";
import { doc as radioGroup } from "./radio-group";
import { doc as scrollArea } from "./scroll-area";
import { doc as select } from "./select";
import { doc as separator } from "./separator";
import { doc as slider } from "./slider";
import { doc as switch_ } from "./switch";
import { doc as tabs } from "./tabs";
import { doc as toast } from "./toast";
import { doc as toggle } from "./toggle";
import { doc as toggleGroup } from "./toggle-group";
import { doc as toolbar } from "./toolbar";
import { doc as tooltip } from "./tooltip";

export const docs: Record<string, PrimitiveDoc> = {
  accordion: accordion,
  "alert-dialog": alertDialog,
  announce: announce,
  "aspect-ratio": aspectRatio,
  avatar: avatar,
  checkbox: checkbox,
  collapsible: collapsible,
  "context-menu": contextMenu,
  dialog: dialog,
  "dropdown-menu": dropdownMenu,
  form: form,
  funnel: funnel,
  "hover-card": hoverCard,
  label: label,
  menubar: menubar,
  motion: motion,
  "navigation-menu": navigationMenu,
  "one-time-password-field": oneTimePasswordField,
  "password-toggle-field": passwordToggleField,
  popover: popover,
  progress: progress,
  "radio-group": radioGroup,
  "scroll-area": scrollArea,
  select: select,
  separator: separator,
  slider: slider,
  switch: switch_,
  tabs: tabs,
  toast: toast,
  toggle: toggle,
  "toggle-group": toggleGroup,
  toolbar: toolbar,
  tooltip: tooltip,
};
