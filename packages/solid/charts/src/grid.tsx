import { For, createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useChartContext, type ScopedProps } from "./container";
import { POLAR_START_ANGLE, angleForIndex, polarPoint, spokeTextAnchor } from "./polar";

/** Props for {@link ChartsGrid}. */
export interface ChartsGridProps extends JSX.SvgSVGAttributes<SVGGElement> {
  /** Draw vertical lines at category boundaries. Defaults to `false`. */
  vertical?: boolean | undefined;
  /** Draw horizontal lines at y ticks. Defaults to `true`. */
  horizontal?: boolean | undefined;
  /** Approximate y tick count for horizontal lines. Defaults to `5`. */
  tickCount?: number | undefined;
}

/**
 * Plot grid lines: horizontal lines at y ticks and optional vertical lines
 * at category boundaries. Decorative, hidden from assistive tech.
 */
export const ChartsGrid: Component<ScopedProps<ChartsGridProps>> = (props) => {
  const rest = omit(props, "__scopeCharts", "vertical", "horizontal", "tickCount", "children");
  const store = useChartContext("ChartsGrid", props.__scopeCharts);
  const boundaries = () => {
    const x = store.x();
    const step = x.step();
    const count = store.labels().length;
    const lines: number[] = [];
    for (let i = 0; i <= count; i += 1) lines.push(i * step);
    return lines;
  };
  return (
    <g aria-hidden="true" {...(rest as JSX.SvgSVGAttributes<SVGGElement>)}>
      {props.horizontal !== false ? (
        <For each={store.yTicks(props.tickCount)}>
          {(tick) => (
            <line
              x1={0}
              x2={store.plotWidth()}
              y1={store.y()(tick)}
              y2={store.y()(tick)}
              stroke="currentColor"
              stroke-opacity={0.15}
            />
          )}
        </For>
      ) : null}
      {props.vertical ? (
        <For each={boundaries()}>
          {(x) => (
            <line
              x1={x}
              x2={x}
              y1={0}
              y2={store.plotHeight()}
              stroke="currentColor"
              stroke-opacity={0.15}
            />
          )}
        </For>
      ) : null}
    </g>
  );
};

/** Props for {@link ChartsRadialGrid}. */
export interface ChartsRadialGridProps extends JSX.SvgSVGAttributes<SVGGElement> {
  /** Spoke count. Defaults to `6`. */
  spokes?: number | undefined;
  /** Concentric ring count. Defaults to `4`. */
  rings?: number | undefined;
  /** Grid radius in pixels. */
  radius: number;
  /** Center x in pixels. Defaults to `0`. */
  cx?: number | undefined;
  /** Center y in pixels. Defaults to `0`. */
  cy?: number | undefined;
  /** Draw concentric rings. Defaults to `true`. */
  circular?: boolean | undefined;
  /** Spoke labels rendered just outside the grid. Length should match `spokes`. */
  labels?: readonly string[] | undefined;
  /** Label offset beyond the grid radius. Defaults to `12`. */
  labelOffset?: number | undefined;
}

/**
 * Radial grid for polar charts: spoke lines plus concentric rings.
 * Decorative, hidden from assistive tech.
 */
export const ChartsRadialGrid: Component<ChartsRadialGridProps> = (props) => {
  const rest = omit(
    props,
    "spokes",
    "rings",
    "radius",
    "cx",
    "cy",
    "circular",
    "labels",
    "labelOffset",
    "children",
  );
  const spokes = createMemo(() => Math.max(3, Math.floor(props.spokes ?? 6)));
  const rings = createMemo(() => Math.max(1, Math.floor(props.rings ?? 4)));
  const radius = createMemo(() => props.radius);
  const cx = createMemo(() => props.cx ?? 0);
  const cy = createMemo(() => props.cy ?? 0);
  // `For` bodies run untracked, so every per-item coordinate is precomputed
  // here: bodies below only read plain item fields, plus `cx`/`cy` inside
  // JSX expressions (which do track).
  const spokeAngles = createMemo(() => {
    const count = spokes();
    return Array.from({ length: count }, (_, i) => angleForIndex(i, count, POLAR_START_ANGLE));
  });
  const spokeEnds = createMemo(() =>
    spokeAngles().map((angle) => polarPoint(cx(), cy(), radius(), angle)),
  );
  const ringRadii = createMemo(() => {
    const count = rings();
    return Array.from({ length: count }, (_, i) => (radius() * (i + 1)) / count);
  });
  const ringPolygons = createMemo(() =>
    ringRadii().map((r) =>
      spokeAngles()
        .map((angle) => {
          const p = polarPoint(cx(), cy(), r, angle);
          return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
        })
        .join(" "),
    ),
  );
  const placedLabels = createMemo(() => {
    const labels = props.labels ?? [];
    const count = spokes();
    const offset = radius() + (props.labelOffset ?? 12);
    return labels.map((label, index) => {
      const angle = angleForIndex(index, count, POLAR_START_ANGLE);
      const p = polarPoint(cx(), cy(), offset, angle);
      return { label, x: p.x, y: p.y, anchor: spokeTextAnchor(angle) };
    });
  });
  return (
    <g aria-hidden="true" {...(rest as JSX.SvgSVGAttributes<SVGGElement>)}>
      <For each={spokeEnds()}>
        {(end) => (
          <line
            x1={cx()}
            y1={cy()}
            x2={end.x}
            y2={end.y}
            stroke="currentColor"
            stroke-opacity={0.15}
          />
        )}
      </For>
      {props.circular !== false ? (
        <For each={ringRadii()}>
          {(r) => (
            <circle
              cx={cx()}
              cy={cy()}
              r={r}
              fill="none"
              stroke="currentColor"
              stroke-opacity={0.15}
            />
          )}
        </For>
      ) : (
        <For each={ringPolygons()}>
          {(points) => (
            <polygon points={points} fill="none" stroke="currentColor" stroke-opacity={0.15} />
          )}
        </For>
      )}
      <For each={placedLabels()}>
        {(item) => (
          <text
            x={item.x}
            y={item.y}
            text-anchor={item.anchor}
            dominant-baseline="middle"
            font-size="11"
            fill="currentColor"
            opacity={0.75}
          >
            {item.label}
          </text>
        )}
      </For>
    </g>
  );
};
