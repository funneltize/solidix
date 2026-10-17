export type PropDef = {
  name: string;
  type?: string | undefined;
  typeSimple?: string | undefined;
  required?: boolean | undefined;
  default?: string | number | boolean | undefined;
  description: string;
};

export type DataAttrDef = {
  attribute: string;
  values: string[];
};

export type CssVarDef = {
  cssVariable: string;
  description: string;
};

export type KeyDef = {
  keys: string[];
  description: string;
};

export type CodeBlock = {
  lang: string;
  highlights: number[];
  code: string;
};

export type ApiPart = {
  name: string;
  description: string;
  props: PropDef[];
  dataAttributes: DataAttrDef[];
  cssVariables: CssVarDef[];
};

export type DocExample = {
  title: string;
  description: string;
  blocks: CodeBlock[];
};

export type PrimitiveDoc = {
  slug: string;
  title: string;
  metaDescription: string;
  ariaLink: string;
  description: string;
  features: string[];
  anatomyIntro: string;
  anatomy: CodeBlock;
  parts: ApiPart[];
  examples: DocExample[];
  customApis: DocExample[];
  accessibility: string;
  keyboard: KeyDef[];
  notes: string;
};
