import type { Component } from "solid-js";
import {
  TooltipProvider as BaseTooltipProvider,
  type TooltipProviderProps as BaseTooltipProviderProps,
} from "@solidix/tooltip";

/** Props for the frosted `TooltipProvider`, matching the base provider. */
export type TooltipProviderProps = BaseTooltipProviderProps;

/**
 * Provides shared tooltip configuration (delays and hover behavior) to
 * descendant tooltips. Alias of the provider from `@solidix/tooltip`,
 * mirroring frosted-ui's re-export of the underlying tooltip provider.
 */
export const TooltipProvider: Component<BaseTooltipProviderProps> = BaseTooltipProvider;
