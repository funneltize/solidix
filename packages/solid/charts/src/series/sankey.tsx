import { For, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { DEFAULT_LABEL_KEY, seriesColor } from "../types";

/**
 * Headless Sankey diagram with a hand-rolled layered layout.
 *
 * Inspired by - not copied from - common Sankey visualizations. No external
 * Sankey dependency: node layering, stacking, and link ribbons are computed
 * by {@link layoutSankey} in this module. Shares the container, highlight,
 * and tooltip stores with the rest of the package.
 */

/** One Sankey link datum: flow from source node to target node. */
export interface SankeyLinkDatum {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Flow value. */
  value: number;
}

/** One Sankey node datum. */
export interface SankeyNodeDatum {
  /** Stable node id, referenced by links. */
  id: string;
  /** Display label. Defaults to the id. */
  label?: string | undefined;
}

/** A laid-out Sankey node with geometry. */
export interface SankeyNode {
  /** Stable node id. */
  id: string;
  /** Display label. */
  label: string;
  /** Node value (max of inflow and outflow). */
  value: number;
  /** Layer depth, 0 for sources. */
  depth: number;
  /** Node rect in plot coordinates. */
  x: number;
  /** Node rect in plot coordinates. */
  y: number;
  /** Node rect in plot coordinates. */
  width: number;
  /** Node rect in plot coordinates. */
  height: number;
  /** Node center, for tooltip anchoring. */
  center: { x: number; y: number };
  /** Suggested fill from the palette. */
  fill: string;
}

/** A laid-out Sankey link with ribbon geometry. */
export interface SankeyLink {
  /** Source node index. */
  sourceIndex: number;
  /** Target node index. */
  targetIndex: number;
  /** Flow value. */
  value: number;
  /** Ribbon thickness in pixels. */
  thickness: number;
  /** SVG path for the ribbon. */
  path: string;
  /** Ribbon midpoint, for tooltip anchoring. */
  center: { x: number; y: number };
  /** Suggested fill from the palette. */
  fill: string;
}

/** Result of {@link layoutSankey}. */
export interface SankeyLayout {
  /** Laid-out nodes, in input order. */
  nodes: SankeyNode[];
  /** Laid-out links, in input order. */
  links: SankeyLink[];
}

/**
 * Layer nodes by longest path from sources, stack each layer, and route link ribbons.
 *
 * @param args The node and link data plus plot size and spacing.
 * @returns Nodes and links with plot-coordinate geometry.
 */
export function layoutSankey(args: {
  /** Node data. */
  nodes: SankeyNodeDatum[];
  /** Link data. */
  links: SankeyLinkDatum[];
  /** Plot width in pixels. */
  plotWidth: number;
  /** Plot height in pixels. */
  plotHeight: number;
  /** Node bar width in pixels. Defaults to `16`. */
  nodeWidth?: number | undefined;
  /** Vertical gap between stacked nodes in pixels. Defaults to `8`. */
  nodePadding?: number | undefined;
}): SankeyLayout {
  const { plotWidth, plotHeight } = args;
  const nodeWidth = args.nodeWidth ?? 16;
  const nodePadding = args.nodePadding ?? 8;
  const ids = args.nodes.map((node) => node.id);
  const indexOf = new Map(ids.map((id, index) => [id, index]));
  const links = args.links.filter((link) => indexOf.has(link.source) && indexOf.has(link.target));
  const count = ids.length;
  if (count === 0) return { nodes: [], links: [] };

  const incoming: number[][] = Array.from({ length: count }, () => []);
  const outgoing: number[][] = Array.from({ length: count }, () => []);
  links.forEach((link, linkIndex) => {
    outgoing[indexOf.get(link.source) ?? 0]?.push(linkIndex);
    incoming[indexOf.get(link.target) ?? 0]?.push(linkIndex);
  });

  const depth = Array.from({ length: count }, () => 0);
  for (let pass = 0; pass < count; pass += 1) {
    let settled = true;
    links.forEach((link) => {
      const from = indexOf.get(link.source) ?? 0;
      const to = indexOf.get(link.target) ?? 0;
      if (depth[to] !== undefined && depth[from] !== undefined && depth[to] < depth[from] + 1) {
        depth[to] = depth[from] + 1;
        settled = false;
      }
    });
    if (settled) break;
  }
  const maxDepth = Math.max(0, ...depth);
  const layers: number[][] = Array.from({ length: maxDepth + 1 }, () => []);
  depth.forEach((d, index) => layers[d]?.push(index));

  const inflow = Array.from({ length: count }, () => 0);
  const outflow = Array.from({ length: count }, () => 0);
  links.forEach((link) => {
    const value = Math.max(0, link.value);
    outflow[indexOf.get(link.source) ?? 0] += value;
    inflow[indexOf.get(link.target) ?? 0] += value;
  });
  const totals = ids.map((_, index) => Math.max(inflow[index] ?? 0, outflow[index] ?? 0, 0));

  let scale = Number.POSITIVE_INFINITY;
  layers.forEach((layer) => {
    const sum = layer.reduce((acc, index) => acc + (totals[index] ?? 0), 0);
    const available = plotHeight - nodePadding * Math.max(0, layer.length - 1);
    if (sum > 0) scale = Math.min(scale, available / sum);
  });
  if (!Number.isFinite(scale) || scale < 0) scale = 0;

  const nodes: SankeyNode[] = ids.map((id, index) => {
    const layer = layers[depth[index] ?? 0] ?? [];
    const position = layer.indexOf(index);
    let y = 0;
    for (let k = 0; k < position; k += 1) {
      y += (totals[layer[k] ?? 0] ?? 0) * scale + nodePadding;
    }
    const height = Math.max(0, (totals[index] ?? 0) * scale);
    const x = maxDepth === 0 ? 0 : ((depth[index] ?? 0) / maxDepth) * (plotWidth - nodeWidth);
    return {
      id,
      label: args.nodes[index]?.label ?? id,
      value: totals[index] ?? 0,
      depth: depth[index] ?? 0,
      x,
      y,
      width: nodeWidth,
      height,
      center: { x: x + nodeWidth / 2, y: y + height / 2 },
      fill: seriesColor({}, depth[index] ?? 0),
    };
  });

  const sourceCursor = Array.from({ length: count }, () => 0);
  const targetCursor = Array.from({ length: count }, () => 0);
  const laidLinks: SankeyLink[] = links.map((link) => {
    const sourceIndex = indexOf.get(link.source) ?? 0;
    const targetIndex = indexOf.get(link.target) ?? 0;
    const source = nodes[sourceIndex] as SankeyNode;
    const target = nodes[targetIndex] as SankeyNode;
    const thickness = Math.max(0, Math.max(0, link.value) * scale);
    const y0 = source.y + (sourceCursor[sourceIndex] ?? 0) + thickness / 2;
    const y1 = target.y + (targetCursor[targetIndex] ?? 0) + thickness / 2;
    sourceCursor[sourceIndex] = (sourceCursor[sourceIndex] ?? 0) + thickness;
    targetCursor[targetIndex] = (targetCursor[targetIndex] ?? 0) + thickness;
    const x0 = source.x + source.width;
    const x1 = target.x;
    const mx = (x0 + x1) / 2;
    const path = `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    return {
      sourceIndex,
      targetIndex,
      value: Math.max(0, link.value),
      thickness,
      path,
      center: { x: (x0 + x1) / 2, y: (y0 + y1) / 2 },
      fill: source.fill,
    };
  });

  return { nodes, links: laidLinks };
}

/** Format a link value pair for labels. */
export function formatSankeyLink(source: string, target: string, value: number): string {
  return `${source} to ${target}: ${value}`;
}

const SANKEY_SERIES_ID = "sankey";

/** Props for {@link SankeyNodes} and {@link SankeyLinks}. */
export interface SankeyPartsProps {
  /** Node data. */
  nodes: SankeyNodeDatum[];
  /** Link data. */
  links: SankeyLinkDatum[];
  /** Node bar width in pixels. Defaults to `16`. */
  nodeWidth?: number | undefined;
  /** Vertical gap between stacked nodes in pixels. Defaults to `8`. */
  nodePadding?: number | undefined;
  /** Link ribbon opacity. Defaults to `0.35`. */
  linkOpacity?: number | undefined;
}

/**
 * Render Sankey node bars. Must be rendered inside a `ChartSurface`.
 *
 * Nodes drive the highlight store and the shared tooltip anchor on pointer
 * and focus; the container dataset mirrors the nodes in order.
 */
export function SankeyNodes(rawProps: ScopedProps<SankeyPartsProps>): JSX.Element {
  const store = useChartContext("SankeyNodes", rawProps.__scopeCharts);
  const layout = () =>
    layoutSankey({
      nodes: rawProps.nodes,
      links: rawProps.links,
      plotWidth: store.plotWidth(),
      plotHeight: store.plotHeight(),
      nodeWidth: rawProps.nodeWidth,
      nodePadding: rawProps.nodePadding,
    });
  return (
    <g
      role="img"
      aria-label={`Sankey chart with ${layout().nodes.length} nodes`}
      data-series-id={SANKEY_SERIES_ID}
    >
      <For each={layout().nodes}>
        {(node, index) => (
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={Math.max(1, node.height)}
            fill={node.fill}
            tabindex={0}
            aria-label={`${node.label}: ${node.value}`}
            data-node-id={node.id}
            data-row-index={index()}
            onPointerEnter={(event: PointerEvent) => {
              store.setHighlighted({ seriesId: SANKEY_SERIES_ID, rowIndex: index() });
              const box = (
                event.currentTarget as unknown as SVGRectElement | null
              )?.getBoundingClientRect?.();
              if (box) store.setAnchor({ x: box.left + box.width / 2, y: box.top });
            }}
            onPointerLeave={() => {
              store.setHighlighted(null);
              store.setAnchor(null);
            }}
            onFocus={() => {
              store.setHighlighted({ seriesId: SANKEY_SERIES_ID, rowIndex: index() });
            }}
            onBlur={() => {
              store.setHighlighted(null);
            }}
            onClick={(event: MouseEvent) => {
              store.clickItem({ seriesId: SANKEY_SERIES_ID, rowIndex: index() }, event);
            }}
          />
        )}
      </For>
    </g>
  );
}

/**
 * Render Sankey link ribbons. Must be rendered inside a `ChartSurface`,
 * before {@link SankeyNodes} so nodes paint above ribbons.
 *
 * Ribbons anchor the shared tooltip; they do not set the highlight item, so
 * the tooltip keeps showing the last focused node.
 */
export function SankeyLinks(rawProps: ScopedProps<SankeyPartsProps>): JSX.Element {
  const store = useChartContext("SankeyLinks", rawProps.__scopeCharts);
  const layout = () =>
    layoutSankey({
      nodes: rawProps.nodes,
      links: rawProps.links,
      plotWidth: store.plotWidth(),
      plotHeight: store.plotHeight(),
      nodeWidth: rawProps.nodeWidth,
      nodePadding: rawProps.nodePadding,
    });
  return (
    <g data-series-id={`${SANKEY_SERIES_ID}-links`} fill="none" aria-hidden="true">
      <For each={layout().links}>
        {(link) => {
          const source = () => layout().nodes[link.sourceIndex];
          const target = () => layout().nodes[link.targetIndex];
          return (
            <path
              d={link.path}
              stroke={link.fill}
              stroke-width={Math.max(1, link.thickness)}
              stroke-opacity={rawProps.linkOpacity ?? 0.35}
              onPointerEnter={(event: PointerEvent) => {
                store.setAnchor({ x: event.clientX, y: event.clientY });
              }}
              onPointerLeave={() => store.setAnchor(null)}
            >
              <title>
                {formatSankeyLink(source()?.label ?? "", target()?.label ?? "", link.value)}
              </title>
            </path>
          );
        }}
      </For>
    </g>
  );
}

export interface ChartsSankeyChartProps extends Omit<
  ChartContainerProps,
  "dataset" | "series" | "children"
> {
  /** Node data. */
  nodes: SankeyNodeDatum[];
  /** Link data. */
  links: SankeyLinkDatum[];
  /** Node bar width in pixels. Defaults to `16`. */
  nodeWidth?: number | undefined;
  /** Vertical gap between stacked nodes in pixels. Defaults to `8`. */
  nodePadding?: number | undefined;
  /** Link ribbon opacity. Defaults to `0.35`. */
  linkOpacity?: number | undefined;
  /** Accessible summary. Defaults to `"Sankey diagram"`. */
  ariaLabel?: string | undefined;
  /** Extra children (surface content such as tooltip). */
  children?: JSX.Element | undefined;
}

/**
 * Composed Sankey diagram: container, surface, ribbons, and node bars.
 *
 * The container dataset mirrors the nodes in order so the shared tooltip and
 * highlight stores work unchanged.
 */
export function ChartsSankeyChart(rawProps: ScopedProps<ChartsSankeyChartProps>): JSX.Element {
  const scope = rawProps.__scopeCharts;
  const dataset = () =>
    rawProps.nodes.map((node) => ({ [DEFAULT_LABEL_KEY]: node.label ?? node.id, value: 0 }));
  const rest = omit(
    rawProps,
    "nodes",
    "links",
    "nodeWidth",
    "nodePadding",
    "linkOpacity",
    "ariaLabel",
    "children",
  );
  return (
    <ChartContainer
      {...rest}
      __scopeCharts={scope}
      dataset={dataset()}
      series={[{ id: SANKEY_SERIES_ID, valueKey: "value" }]}
    >
      <ChartSurface __scopeCharts={scope} ariaLabel={rawProps.ariaLabel ?? "Sankey diagram"}>
        <SankeyLinks
          __scopeCharts={scope}
          nodes={rawProps.nodes}
          links={rawProps.links}
          nodeWidth={rawProps.nodeWidth}
          nodePadding={rawProps.nodePadding}
          linkOpacity={rawProps.linkOpacity}
        />
        <SankeyNodes
          __scopeCharts={scope}
          nodes={rawProps.nodes}
          links={rawProps.links}
          nodeWidth={rawProps.nodeWidth}
          nodePadding={rawProps.nodePadding}
          linkOpacity={rawProps.linkOpacity}
        />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
