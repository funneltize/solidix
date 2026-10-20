import animation from "../../../docs/animation.md?raw";
import composition from "../../../docs/composition.md?raw";
import forms from "../../../docs/forms.md?raw";
import migrating from "../../../docs/migrating.md?raw";
import styling from "../../../docs/styling.md?raw";
import state from "../../../docs/state.md?raw";
import testing from "../../../docs/testing.md?raw";

export type GuideEntry = {
  slug: string;
  title: string;
  description: string;
  markdown: string;
};

export const guides: GuideEntry[] = [
  {
    slug: "migrating",
    title: "Migrating from Radix",
    description: "The React-to-Solidix deltas: signals, native events, refs, and platform names.",
    markdown: migrating,
  },
  {
    slug: "composition",
    title: "Composition",
    description: "Render parts as your own elements with asChild, and how prop merging works.",
    markdown: composition,
  },
  {
    slug: "state",
    title: "State management",
    description: "Controlled versus uncontrolled usage, signals, and change notifications.",
    markdown: state,
  },
  {
    slug: "styling",
    title: "Styling",
    description: "Data-attribute hooks, classes, kebab-case styles, and theming.",
    markdown: styling,
  },
  {
    slug: "animation",
    title: "Animation",
    description: "Exit tracking, forceMount, Presence rules, and the motion package.",
    markdown: animation,
  },
  {
    slug: "forms",
    title: "Forms",
    description: "Bubble inputs, labels, native submit and reset, and the Form package.",
    markdown: forms,
  },
  {
    slug: "testing",
    title: "Testing",
    description: "Flushing updates, settling portals, and the shared jsdom stubs.",
    markdown: testing,
  },
];

export const guideBySlug: Record<string, GuideEntry> = Object.fromEntries(
  guides.map((guide) => [guide.slug, guide]),
);
