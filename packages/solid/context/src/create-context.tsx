import {
  createContext as createSolidContext,
  omit,
  useContext as useSolidContext,
  type Component,
  type Context,
} from "solid-js";
import type { JSX } from "@solidjs/web";

type ContextProvider<ContextValueType extends object | null> = Component<
  ContextValueType & {
    children?: JSX.Element;
  }
>;

interface UseAssertedContext<ContextValueType extends object | null> {
  (consumerName: string): ContextValueType;
}

interface UseContext<ContextValueType extends object | null> {
  (consumerName: string): ContextValueType;
  (consumerName: string, options: { optional: true }): ContextValueType | undefined;
}

function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
): readonly [ContextProvider<ContextValueType>, UseContext<ContextValueType>];
function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext: ContextValueType,
): readonly [ContextProvider<ContextValueType>, UseAssertedContext<ContextValueType>];

/* @__NO_SIDE_EFFECTS__ */ function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType,
): readonly [ContextProvider<ContextValueType>, UseContext<ContextValueType>] {
  const SolidContext =
    defaultContext === undefined
      ? createSolidContext<ContextValueType | undefined>()
      : createSolidContext<ContextValueType | undefined>(defaultContext);

  const Provider: ContextProvider<ContextValueType> = (props) => {
    const context = omit(props, "children");
    return <SolidContext value={context as ContextValueType}>{props.children}</SolidContext>;
  };

  function useContext(consumerName: string): ContextValueType;
  function useContext(
    consumerName: string,
    options: { optional: true },
  ): ContextValueType | undefined;

  function useContext(
    consumerName: string,
    options: { optional?: boolean | undefined } = {},
  ): ContextValueType | undefined {
    const { optional = false } = options;
    // Solid's `useContext` throws `ContextNotFoundError` when unprovided;
    // treat that as missing so we can apply default/optional/required logic.
    let context: ContextValueType | undefined;
    try {
      context = useSolidContext(SolidContext);
    } catch {
      context = undefined;
    }
    if (context) return context;
    if (defaultContext !== undefined) return defaultContext;
    if (optional) return undefined;
    // if a defaultContext wasn't specified, it's a required context.
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }

  return [Provider, useContext];
}

/* -------------------------------------------------------------------------------------------------
 * createContextScope
 * -----------------------------------------------------------------------------------------------*/

type Scope<C = any> = { [scopeName: string]: Context<C>[] } | undefined;
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };
interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

type ScopedContextProvider<ContextValueType extends object | null> = Component<
  ContextValueType & {
    scope: Scope<ContextValueType>;
    children?: JSX.Element;
  }
>;

interface UseScopedContext<ContextValueType extends object | null> {
  (consumerName: string, scope: Scope<ContextValueType | undefined>): ContextValueType;
  (
    consumerName: string,
    scope: Scope<ContextValueType | undefined>,
    options: { optional?: true | undefined },
  ): ContextValueType | undefined;
}

interface UseAssertedScopedContext<ContextValueType extends object | null> {
  (consumerName: string, scope: Scope<ContextValueType | undefined>): ContextValueType;
}

interface CreateScopedContext {
  <ContextValueType extends object | null>(
    rootComponentName: string,
  ): readonly [ScopedContextProvider<ContextValueType>, UseScopedContext<ContextValueType>];
  <ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext: ContextValueType,
  ): readonly [ScopedContextProvider<ContextValueType>, UseAssertedScopedContext<ContextValueType>];
}

/* @__NO_SIDE_EFFECTS__ */ function createContextScope(
  scopeName: string,
  createContextScopeDeps: CreateScope[] = [],
): readonly [CreateScopedContext, CreateScope] {
  let defaultContexts: any[] = [];

  /* -----------------------------------------------------------------------------------------------
   * createContext
   * ---------------------------------------------------------------------------------------------*/

  function createContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType,
  ) {
    const BaseContext =
      defaultContext === undefined
        ? createSolidContext<ContextValueType | undefined>()
        : createSolidContext<ContextValueType | undefined>(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];

    const Provider: ScopedContextProvider<ContextValueType> = (props) => {
      const context = omit(props, "scope", "children");
      const SolidContext = props.scope?.[scopeName]?.[index] || BaseContext;
      return <SolidContext value={context as ContextValueType}>{props.children}</SolidContext>;
    };

    function useContext(
      consumerName: string,
      scope: Scope<ContextValueType | undefined>,
    ): ContextValueType;
    function useContext(
      consumerName: string,
      scope: Scope<ContextValueType | undefined>,
      options: { optional: true },
    ): ContextValueType | undefined;

    function useContext(
      consumerName: string,
      scope: Scope<ContextValueType | undefined>,
      options: { optional?: boolean | undefined } = {},
    ): ContextValueType | undefined {
      const { optional = false } = options;
      const SolidContext = scope?.[scopeName]?.[index] || BaseContext;
      let context: ContextValueType | undefined;
      try {
        context = useSolidContext(SolidContext);
      } catch {
        context = undefined;
      }
      if (context) return context;
      if (defaultContext !== undefined) return defaultContext;
      if (optional) return undefined;
      // if a defaultContext wasn't specified, it's a required context.
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }

    return [Provider, useContext] as const;
  }

  /* -----------------------------------------------------------------------------------------------
   * createScope
   * ---------------------------------------------------------------------------------------------*/

  const createScope: CreateScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return createSolidContext(defaultContext);
    });
    return function useScope(scope: Scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return { [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } };
    };
  };

  createScope.scopeName = scopeName;
  return [createContext, composeContextScopes(createScope, ...createContextScopeDeps)] as const;
}

/* -------------------------------------------------------------------------------------------------
 * composeContextScopes
 * -----------------------------------------------------------------------------------------------*/

function composeContextScopes(...scopes: [CreateScope, ...CreateScope[]]): CreateScope {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;

  const createScope: CreateScope = () => {
    const scopeHooks = scopes.map((createScope) => ({
      useScope: createScope(),
      scopeName: createScope.scopeName,
    }));

    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes, ...currentScope };
      }, {});

      return { [`__scope${baseScope.scopeName}`]: nextScopes };
    };
  };

  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

/* -----------------------------------------------------------------------------------------------*/

export { createContext, createContextScope };
export type {
  CreateScope,
  Scope,
  UseAssertedContext,
  UseAssertedScopedContext,
  UseContext,
  UseScopedContext,
};
