import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  "slug": "slider",
  "title": "Slider",
  "metaDescription": "An input where the user selects a value from within a given range.",
  "ariaLink": "https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb",
  "description": "An input where the user selects a value from within a given range.",
  "features": [
    "Can be controlled or uncontrolled.",
    "Supports multiple thumbs.",
    "Supports a minimum value between thumbs.",
    "Supports touch or click on track to update value.",
    "Supports Right to Left direction.",
    "Full keyboard navigation."
  ],
  "anatomyIntro": "Import all parts and piece them together.",
  "anatomy": {
    "lang": "jsx",
    "highlights": [],
    "code": "import { Slider } from \"solidix\";\n\nexport default () => (\n\t<Slider.Root>\n\t\t<Slider.Track>\n\t\t\t<Slider.Range />\n\t\t</Slider.Track>\n\t\t<Slider.Thumb />\n\t</Slider.Root>\n);"
  },
  "parts": [
    {
      "name": "Root",
      "description": "Contains all the parts of a slider. It will render an `input` for each thumb when used within a `form` to ensure events propagate correctly.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        },
        {
          "name": "defaultValue",
          "required": false,
          "type": "number[]",
          "description": "The value of the slider when initially rendered. Use when you do not need to control the state of the slider."
        },
        {
          "name": "value",
          "required": false,
          "type": "number[]",
          "description": "The controlled value of the slider. Must be used in conjunction with `onValueChange`."
        },
        {
          "name": "onValueChange",
          "required": false,
          "type": "onValueChange?(value: number[]): void",
          "typeSimple": "function",
          "description": "Event handler called when the value changes."
        },
        {
          "name": "onValueCommit",
          "required": false,
          "type": "onValueCommit?(value: number[]): void",
          "typeSimple": "function",
          "description": "Event handler called when the value changes at the end of an interaction. Useful when you only need to capture a final value e.g. to update a backend service."
        },
        {
          "name": "name",
          "required": false,
          "type": "string",
          "description": "The name of the slider. Submitted with its owning form as part of a name/value pair."
        },
        {
          "name": "disabled",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "When `true`, prevents the user from interacting with the slider."
        },
        {
          "name": "orientation",
          "required": false,
          "type": "\"horizontal\" | \"vertical\"",
          "typeSimple": "enum",
          "default": "\"horizontal\"",
          "description": "The orientation of the slider."
        },
        {
          "name": "dir",
          "required": false,
          "type": "\"ltr\" | \"rtl\"",
          "typeSimple": "enum",
          "description": "The reading direction of the slider. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode."
        },
        {
          "name": "inverted",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Whether the slider is visually inverted."
        },
        {
          "name": "min",
          "required": false,
          "type": "number",
          "default": "0",
          "description": "The minimum value for the range."
        },
        {
          "name": "max",
          "required": false,
          "type": "number",
          "default": "100",
          "description": "The maximum value for the range."
        },
        {
          "name": "step",
          "required": false,
          "type": "number",
          "default": "1",
          "description": "The stepping interval."
        },
        {
          "name": "minStepsBetweenThumbs",
          "required": false,
          "type": "number",
          "default": "0",
          "description": "The minimum permitted `step`s between multiple thumbs."
        },
        {
          "name": "form",
          "required": false,
          "type": "string",
          "description": "The ID of the form that the slider belongs to. If omitted, the slider will be associated with a parent form if one exists."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        },
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Track",
      "description": "The track that contains the `Slider.Range`.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        },
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Range",
      "description": "The range part. Must live inside `Slider.Track`.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        },
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    },
    {
      "name": "Thumb",
      "description": "A draggable thumb. You can render multiple thumbs.",
      "props": [
        {
          "name": "asChild",
          "required": false,
          "type": "boolean",
          "default": "false",
          "description": "Change the default rendered element for the one passed as a child, merging their props and behavior.\n\nRead our Composition guide for more details."
        }
      ],
      "dataAttributes": [
        {
          "attribute": "[data-disabled]",
          "values": [
            "Present when disabled"
          ]
        },
        {
          "attribute": "[data-orientation]",
          "values": [
            "vertical",
            "horizontal"
          ]
        }
      ],
      "cssVariables": []
    }
  ],
  "examples": [
    {
      "title": "Vertical orientation",
      "description": "Use the `orientation` prop to create a vertical slider.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            6
          ],
          "code": "// index.jsx\nimport { Slider } from \"solidix\";\nimport \"./styles.css\";\n\nexport default () => (\n\t<Slider.Root\n\t\tclass=\"SliderRoot\"\n\t\tdefaultValue={[50]}\n\t\torientation=\"vertical\"\n\t>\n\t\t<Slider.Track class=\"SliderTrack\">\n\t\t\t<Slider.Range class=\"SliderRange\" />\n\t\t</Slider.Track>\n\t\t<Slider.Thumb class=\"SliderThumb\" />\n\t</Slider.Root>\n);"
        },
        {
          "lang": "css",
          "highlights": [
            7,
            18,
            26
          ],
          "code": "/* styles.css */\n.SliderRoot {\n\tposition: relative;\n\tdisplay: flex;\n\talign-items: center;\n}\n.SliderRoot[data-orientation=\"vertical\"] {\n\tflex-direction: column;\n\twidth: 20px;\n\theight: 100px;\n}\n\n.SliderTrack {\n\tposition: relative;\n\tflex-grow: 1;\n\tbackground-color: grey;\n}\n.SliderTrack[data-orientation=\"vertical\"] {\n\twidth: 3px;\n}\n\n.SliderRange {\n\tposition: absolute;\n\tbackground-color: black;\n}\n.SliderRange[data-orientation=\"vertical\"] {\n\twidth: 100%;\n}\n\n.SliderThumb {\n\tdisplay: block;\n\twidth: 20px;\n\theight: 20px;\n\tbackground-color: black;\n}"
        }
      ]
    },
    {
      "title": "Create a range",
      "description": "Add multiple thumbs and values to create a range slider.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            4,
            8,
            9
          ],
          "code": "import { Slider } from \"solidix\";\n\nexport default () => (\n\t<Slider.Root defaultValue={[25, 75]}>\n\t\t<Slider.Track>\n\t\t\t<Slider.Range />\n\t\t</Slider.Track>\n\t\t<Slider.Thumb />\n\t\t<Slider.Thumb />\n\t</Slider.Root>\n);"
        }
      ]
    },
    {
      "title": "Define step size",
      "description": "Use the `step` prop to increase the stepping interval.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            4
          ],
          "code": "import { Slider } from \"solidix\";\n\nexport default () => (\n\t<Slider.Root defaultValue={[50]} step={10}>\n\t\t<Slider.Track>\n\t\t\t<Slider.Range />\n\t\t</Slider.Track>\n\t\t<Slider.Thumb />\n\t</Slider.Root>\n);"
        }
      ]
    },
    {
      "title": "Prevent thumb overlap",
      "description": "Use `minStepsBetweenThumbs` to avoid thumbs with equal values.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [
            4
          ],
          "code": "import { Slider } from \"solidix\";\n\nexport default () => (\n\t<Slider.Root defaultValue={[25, 75]} step={10} minStepsBetweenThumbs={1}>\n\t\t<Slider.Track>\n\t\t\t<Slider.Range />\n\t\t</Slider.Track>\n\t\t<Slider.Thumb />\n\t\t<Slider.Thumb />\n\t</Slider.Root>\n);"
        }
      ]
    },
    {
      "title": "Decoupling the hidden input",
      "description": "By default, `Slider.Thumb` renders a visually hidden `input` for form submission. To recompose, move, or exclude that input, you can build each thumb from its lower-level parts instead.\n\n> **Important:** These parts are unstable and prefixed with `unstable_`, so their API may change in a future release.\n\n- `Slider.unstable_ThumbProvider` provides the thumb state and accepts an optional `name` for the submitted value.\n- `Slider.unstable_ThumbTrigger` is the draggable thumb element.\n- `Slider.unstable_BubbleInput` is the visually hidden input that `Slider.Thumb` renders by default. Omit it when you don't need form submission.",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { Slider } from \"solidix\";\n\nexport default () => (\n\t<Slider.Root defaultValue={[25, 75]}>\n\t\t<Slider.Track>\n\t\t\t<Slider.Range />\n\t\t</Slider.Track>\n\n\t\t<Slider.ThumbProvider name=\"price[min]\">\n\t\t\t<Slider.ThumbTrigger />\n\t\t\t<Slider.BubbleInput />\n\t\t</Slider.ThumbProvider>\n\n\t\t<Slider.ThumbProvider name=\"price[max]\">\n\t\t\t<Slider.ThumbTrigger />\n\t\t\t<Slider.BubbleInput />\n\t\t</Slider.ThumbProvider>\n\t</Slider.Root>\n);"
        }
      ]
    }
  ],
  "customApis": [
    {
      "title": "Abstract all parts",
      "description": "This example abstracts all of the `Slider` parts so it can be used as a self closing element.\n\n#### Usage\n\n\n\n#### Implementation",
      "blocks": [
        {
          "lang": "jsx",
          "highlights": [],
          "code": "import { Slider } from \"./your-slider\";\n\nexport default () => <Slider defaultValue={[25]} />;"
        },
        {
          "lang": "jsx",
          "highlights": [],
          "code": "// your-slider.jsx\nimport { For, omit } from \"solid-js\";\nimport { Slider as SliderPrimitive } from \"solidix\";\n\nexport const Slider = (props) => {\n\tconst rest = omit(props, \"ref\");\n\tconst value = () => props.value ?? props.defaultValue ?? [];\n\n\treturn (\n\t\t<SliderPrimitive.Root {...rest} ref={props.ref}>\n\t\t\t<SliderPrimitive.Track>\n\t\t\t\t<SliderPrimitive.Range />\n\t\t\t</SliderPrimitive.Track>\n\t\t\t<For each={value()}>{() => <SliderPrimitive.Thumb />}</For>\n\t\t</SliderPrimitive.Root>\n\t);\n};"
        }
      ]
    }
  ],
  "accessibility": "Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb).",
  "keyboard": [
    {
      "keys": [
        "ArrowRight"
      ],
      "description": "Increments/decrements by the `step` value depending on `orientation`."
    },
    {
      "keys": [
        "ArrowLeft"
      ],
      "description": "Increments/decrements by the `step` value depending on `orientation`."
    },
    {
      "keys": [
        "ArrowUp"
      ],
      "description": "Increases the value by the `step` amount."
    },
    {
      "keys": [
        "ArrowDown"
      ],
      "description": "Decreases the value by the `step` amount."
    },
    {
      "keys": [
        "PageUp"
      ],
      "description": "Increases the value by a larger `step`."
    },
    {
      "keys": [
        "PageDown"
      ],
      "description": "Decreases the value by a larger `step`."
    },
    {
      "keys": [
        "Shift + ArrowUp"
      ],
      "description": "Increases the value by a larger `step`."
    },
    {
      "keys": [
        "Shift + ArrowDown"
      ],
      "description": "Decreases the value by a larger `step`."
    },
    {
      "keys": [
        "Home"
      ],
      "description": "Sets the value to its minimum."
    },
    {
      "keys": [
        "End"
      ],
      "description": "Sets the value to its maximum."
    }
  ],
  "notes": "### Mouse events are not fired\n\nBecause of [a limitation](https://github.com/radix-ui/primitives/blob/83a8c13bf66f3d9f17d77caeb187a69eb146930b/packages/react/slider/src/Slider.tsx#L383-L384) we faced during implementation, the following example won't work as expected and the `onMouseDown` and `onMouseUp` event handlers won't be fired:\n\n```jsx\n<Slider.Root\n\tonMouseDown={() => console.log(\"onMouseDown\")}\n\tonMouseUp={() => console.log(\"onMouseUp\")}\n>\n\t…\n</Slider.Root>\n```\n\nWe recommend using pointer events instead (eg. `onPointerDown`, `onPointerUp`). Regardless of the above limitation, these events are better suited for cross-platform/device handling as they are fired for all pointer input types (mouse, touch, pen, etc.)."
};
