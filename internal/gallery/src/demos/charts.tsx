import { For, createSignal } from "solid-js";
import { Charts } from "solidix";

const rows = [
  { label: "Jan", web: 4200, mobile: 2800, store: 1500 },
  { label: "Feb", web: 3800, mobile: 3200, store: 1700 },
  { label: "Mar", web: 5100, mobile: 3600, store: 1400 },
  { label: "Apr", web: 4700, mobile: 4100, store: 1900 },
  { label: "May", web: 5600, mobile: 3900, store: 2200 },
  { label: "Jun", web: 6200, mobile: 4500, store: 2100 },
];

const series = [
  { id: "web", label: "Web", valueKey: "web" },
  { id: "mobile", label: "Mobile", valueKey: "mobile" },
  { id: "store", label: "In store", valueKey: "store" },
] as const;

const fitness = [
  { label: "Speed", current: 82, target: 90 },
  { label: "Endurance", current: 64, target: 80 },
  { label: "Strength", current: 74, target: 85 },
  { label: "Agility", current: 88, target: 88 },
  { label: "Recovery", current: 70, target: 95 },
];

const fitnessSeries = [
  { id: "current", label: "Current", valueKey: "current" },
  { id: "target", label: "Target", valueKey: "target" },
] as const;

const weeklyTraffic = [
  { label: "Mon", visits: 1200 },
  { label: "Tue", visits: 1900 },
  { label: "Wed", visits: 1500 },
  { label: "Thu", visits: 2200 },
  { label: "Fri", visits: 2800 },
  { label: "Sat", visits: 3400 },
  { label: "Sun", visits: 2600 },
];

const heatHours = ["9a", "10a", "11a", "12p", "1p", "2p"];
const heatDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const heatValues = [
  [12, 18, 15, 22, 30],
  [24, 31, 28, 35, 41],
  [33, 29, 38, 44, 52],
  [45, 51, 48, 55, 61],
  [39, 44, 41, 49, 57],
  [28, 33, 31, 36, 43],
];

const funnelStages = [
  { id: "visited", label: "Visited", value: 10000 },
  { id: "signup", label: "Signed up", value: 4200 },
  { id: "activated", label: "Activated", value: 1800 },
  { id: "paid", label: "Paid", value: 640 },
];

const sankeyNodes = [
  { id: "direct", label: "Direct" },
  { id: "search", label: "Search" },
  { id: "social", label: "Social" },
  { id: "signup", label: "Signup" },
  { id: "trial", label: "Trial" },
  { id: "paid", label: "Paid" },
];
const sankeyLinks = [
  { source: "direct", target: "signup", value: 3200 },
  { source: "search", target: "signup", value: 5100 },
  { source: "social", target: "signup", value: 2700 },
  { source: "signup", target: "trial", value: 6800 },
  { source: "trial", target: "paid", value: 2400 },
];

const ohlc = [
  { label: "Mon", open: 100, high: 108, low: 97, close: 105 },
  { label: "Tue", open: 105, high: 110, low: 102, close: 109 },
  { label: "Wed", open: 109, high: 112, low: 104, close: 106 },
  { label: "Thu", open: 106, high: 107, low: 99, close: 101 },
  { label: "Fri", open: 101, high: 106, low: 100, close: 104 },
];

export default function ChartsDemo() {
  const [stacked, setStacked] = createSignal(false);
  const [area, setArea] = createSignal(true);
  const [circular, setCircular] = createSignal(false);

  return (
    <div class="ChartsDemo">
      <section class="ChartsCard" aria-labelledby="charts-bars-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-bars-title">Revenue by channel</h3>
          <label class="ChartsToggle">
            <input
              type="checkbox"
              checked={stacked()}
              onChange={(event) => setStacked(event.currentTarget.checked)}
            />
            Stacked
          </label>
        </div>
        <Charts.BarChart
          dataset={rows}
          series={series}
          width={620}
          height={340}
          stacked={stacked()}
          radius={3}
          ariaLabel="Monthly revenue by sales channel"
          formatValue={(value) => `$${((value ?? 0) / 1000).toFixed(1)}k`}
        />
      </section>

      <section class="ChartsCard" aria-labelledby="charts-lines-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-lines-title">Growth trend</h3>
          <label class="ChartsToggle">
            <input
              type="checkbox"
              checked={area()}
              onChange={(event) => setArea(event.currentTarget.checked)}
            />
            Area fill
          </label>
        </div>
        <Charts.LineChart
          dataset={rows}
          series={series}
          width={620}
          height={340}
          area={area()}
          curve="monotoneX"
          strokeWidth={2.5}
          ariaLabel="Monthly revenue trend by sales channel"
          formatValue={(value) => `$${((value ?? 0) / 1000).toFixed(1)}k`}
        />
      </section>

      <section class="ChartsCard" aria-labelledby="charts-pie-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-pie-title">Traffic share</h3>
          <p class="ChartsHint">
            Toggle a source in the legend; the pie follows the first visible series.
          </p>
        </div>
        <Charts.ChartContainer dataset={rows} series={series} width={620} height={360}>
          <Charts.ChartSurface ariaLabel="Traffic share by channel">
            {/* Radii are pixels, padAngle radians: ~45% donut hole, 0.02 rad gaps. */}
            <Charts.PiePlot innerRadius={74} padAngle={0.02} cornerRadius={3} />
          </Charts.ChartSurface>
          <Charts.ChartsLegend />
        </Charts.ChartContainer>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-scatter-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-scatter-title">Mobile vs web sessions</h3>
        </div>
        <Charts.ScatterChart
          dataset={rows}
          series={[{ id: "mobile", label: "Mobile", valueKey: "mobile" }]}
          xDataKey="web"
          width={620}
          height={340}
          radius={5}
          ariaLabel="Mobile sessions plotted against web sessions"
        />
      </section>

      <section class="ChartsCard" aria-labelledby="charts-spark-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-spark-title">This week at a glance</h3>
        </div>
        <div class="ChartsStrip">
          <figure class="ChartsKpi">
            <figcaption>Web sessions</figcaption>
            <strong>6.2k</strong>
            <Charts.SparkLineChart
              dataset={rows}
              series={[{ id: "web", label: "Web", valueKey: "web" }]}
              width={150}
              height={44}
              ariaLabel="Web sessions trend"
            />
          </figure>
          <figure class="ChartsKpi">
            <figcaption>Mobile sessions</figcaption>
            <strong>4.5k</strong>
            <Charts.SparkLineChart
              dataset={rows}
              series={[{ id: "mobile", label: "Mobile", valueKey: "mobile" }]}
              width={150}
              height={44}
              ariaLabel="Mobile sessions trend"
            />
          </figure>
          <figure class="ChartsKpi">
            <figcaption>In-store visits</figcaption>
            <strong>2.1k</strong>
            <Charts.SparkLineChart
              dataset={rows}
              series={[{ id: "store", label: "In store", valueKey: "store" }]}
              width={150}
              height={44}
              ariaLabel="In-store visits trend"
            />
          </figure>
        </div>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-gauge-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-gauge-title">Targets</h3>
        </div>
        <div class="ChartsStrip">
          <Charts.Gauge
            value={78}
            width={150}
            height={110}
            text="78%"
            ariaLabel="Quarterly target: 78 percent"
          />
          <Charts.Gauge
            value={12400}
            min={0}
            max={20000}
            width={150}
            height={110}
            text="$12.4k"
            ariaLabel="Monthly revenue: 12.4 thousand of 20 thousand dollars"
          />
          <Charts.Gauge
            value={92}
            width={150}
            height={110}
            showPointer={false}
            text="A-"
            ariaLabel="Support score: 92 of 100"
          />
        </div>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-radar-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-radar-title">Radar</h3>
          <label class="ChartsToggle">
            <input
              type="checkbox"
              checked={circular()}
              onChange={(event) => setCircular(event.currentTarget.checked)}
            />
            Circular grid
          </label>
        </div>
        <Charts.RadarChart
          dataset={fitness}
          series={fitnessSeries}
          width={620}
          height={360}
          max={100}
          circular={circular()}
          ariaLabel="Fitness scores against targets"
        >
          <Charts.ChartsLegend />
          <Charts.ChartsTooltip />
        </Charts.RadarChart>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-radial-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-radial-title">Radial bars and lines</h3>
        </div>
        <div class="ChartsDuo">
          <figure class="ChartsDuoItem">
            <Charts.RadialBarChart
              dataset={weeklyTraffic}
              series={[{ id: "visits", label: "Visits", valueKey: "visits" }]}
              width={290}
              height={300}
              ariaLabel="Weekly visits as radial bars"
            >
              <Charts.ChartsTooltip />
            </Charts.RadialBarChart>
            <figcaption>Radial bars</figcaption>
          </figure>
          <figure class="ChartsDuoItem">
            <Charts.RadialLineChart
              dataset={fitness}
              series={fitnessSeries}
              width={290}
              height={300}
              max={100}
              ariaLabel="Fitness scores as radial lines"
            >
              <Charts.ChartsTooltip />
            </Charts.RadialLineChart>
            <figcaption>Radial lines</figcaption>
          </figure>
        </div>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-candle-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-candle-title">Candlestick</h3>
        </div>
        <Charts.CandlestickChart
          dataset={ohlc}
          width={620}
          height={320}
          seriesLabel="Price"
          ariaLabel="Weekly price candles"
        >
          <Charts.CandlestickTooltip />
        </Charts.CandlestickChart>
        <p class="ChartsHint">Green bodies closed up, red bodies closed down.</p>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-heatmap-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-heatmap-title">Heatmap</h3>
          <p class="ChartsHint">
            Hourly signups by weekday. Cells carry per-cell accessible names.
          </p>
        </div>
        <Charts.ChartsHeatmap
          xLabels={heatHours}
          yLabels={heatDays}
          values={heatValues}
          width={620}
          height={340}
          ariaLabel="Signups by hour and weekday"
        >
          <Charts.ChartsTooltip />
        </Charts.ChartsHeatmap>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-funnel-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-funnel-title">Funnel</h3>
          <p class="ChartsHint">
            Trial pipeline from visit to paid. Each stage shows its conversion from the previous stage.
          </p>
        </div>
        <Charts.ChartsFunnelChart
          stages={funnelStages.map((stage) => stage.label)}
          values={funnelStages.map((stage) => stage.value)}
          width={620}
          height={340}
          ariaLabel="Trial pipeline funnel"
        >
          <Charts.ChartsTooltip />
        </Charts.ChartsFunnelChart>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-sankey-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-sankey-title">Sankey</h3>
          <p class="ChartsHint">
            Acquisition flow from channel to paid. Ribbons are sized by flow value.
          </p>
        </div>
        <Charts.ChartsSankeyChart
          nodes={sankeyNodes}
          links={sankeyLinks}
          width={620}
          height={340}
          ariaLabel="Acquisition flow"
        >
          <Charts.ChartsTooltip />
        </Charts.ChartsSankeyChart>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-zoom-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-zoom-title">Zoom and brush</h3>
          <p class="ChartsHint">
            Drag on the plot to select a range, double click to reset, or use the buttons.
          </p>
        </div>
        <Charts.ChartContainer dataset={rows} series={series} width={620} height={340}>
          <Charts.ChartSurface ariaLabel="Monthly revenue trend with zoom and brush">
            <Charts.ChartsGrid />
            <Charts.LinePlot strokeWidth={2.5} />
            <Charts.ChartsXAxis />
            <Charts.ChartsYAxis formatTick={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Charts.ChartsBrush />
          </Charts.ChartSurface>
          <Charts.ChartsTooltip>
            {(entry) => (
              <dl>
                <dt>{entry.label}</dt>
                <For each={entry.entries}>
                  {(item) => (
                    <div>
                      <dt>{item.label}</dt>
                      <dd>
                        {item.value === undefined ? "-" : `$${(item.value / 1000).toFixed(1)}k`}
                      </dd>
                    </div>
                  )}
                </For>
              </dl>
            )}
          </Charts.ChartsTooltip>
          <Charts.ChartsZoomControls class="ChartsZoomControls" />
        </Charts.ChartContainer>
      </section>

      <section class="ChartsCard" aria-labelledby="charts-composed-title">
        <div class="ChartsCardHeader">
          <h3 id="charts-composed-title">Composed parts</h3>
          <p class="ChartsHint">
            Hover or focus a bar for the tooltip; toggle series in the legend.
          </p>
        </div>
        <Charts.ChartContainer dataset={rows} series={series} width={620} height={340}>
          <Charts.ChartSurface ariaLabel="Monthly revenue by sales channel, composed from parts">
            <Charts.ChartsGrid />
            <Charts.Bars radius={3} />
            <Charts.ChartsXAxis />
            <Charts.ChartsYAxis formatTick={(value) => `$${(value / 1000).toFixed(0)}k`} />
          </Charts.ChartSurface>
          <Charts.ChartsTooltip />
          <Charts.ChartsLegend />
        </Charts.ChartContainer>
      </section>
    </div>
  );
}
