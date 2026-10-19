import { For, type Component } from "solid-js";
import { demos } from "./demos/registry";
import { docs } from "./docs/index";
import { CodeBlock } from "./highlight";

const Landing: Component = () => (
  <div class="landing">
    <section class="hero">
      <p class="eyebrow">Radix UI, rebuilt for Solid 2</p>
      <h1>
        Accessible, unstyled UI primitives <span class="hero-accent">for Solid&nbsp;2.</span>
      </h1>
      <p class="lede">
        Solidix ports Radix Primitives to Solid 2 with full API parity: the same parts, behavior,
        and accessibility - on fine-grained reactivity, with zero virtual DOM. A built-in motion
        system adds spring physics, View Transitions, and swipe gestures with no animation engine.
      </p>
      <div class="hero-cta">
        <a class="btn primary" href="#/accordion">
          Browse primitives
        </a>
        <a
          class="btn"
          href="https://github.com/funneltize/solidix"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
      <div class="hero-install">
        <CodeBlock code="pnpm add solidix solid-js @solidjs/web" lang="bash" title="terminal" />
      </div>
    </section>

    <section class="pillars">
      <div class="pillar">
        <span class="pillar-num">01</span>
        <h2>Accessible by default</h2>
        <p>
          Keyboard navigation, focus management, and WAI-ARIA patterns ported from Radix and
          verified per primitive - not bolted on after.
        </p>
      </div>
      <div class="pillar">
        <span class="pillar-num">02</span>
        <h2>Unstyled by design</h2>
        <p>
          No CSS ships with the primitives. State hooks arrive as data attributes, so any styling
          solution applies cleanly.
        </p>
      </div>
      <div class="pillar">
        <span class="pillar-num">03</span>
        <h2>Solid to the core</h2>
        <p>
          Signals, memos, and directives instead of ported hooks. Tree-shakeable packages with no
          runtime beyond Solid itself.
        </p>
      </div>
    </section>

    <section class="primitive-index" id="primitives">
      <div class="primitive-index-head">
        <h2>Primitives</h2>
        <span class="count">{demos.length}</span>
      </div>
      <ul class="primitive-grid">
        <For each={demos}>
          {(demo) => (
            <li>
              <a class="primitive-card" href={`#/${demo.slug}`}>
                <span class="primitive-card-title">{demo.title}</span>
                <span class="primitive-card-desc">
                  {docs[demo.slug]?.metaDescription || docs[demo.slug]?.description || ""}
                </span>
                <span class="primitive-card-go" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          )}
        </For>
      </ul>
    </section>

    <section class="parity-band">
      <h2>Parity first, Solid where it matters</h2>
      <p>
        Component set, behavior, keyboard interaction, and ARIA mirror Radix UI. Where React and
        Solid differ, the API adapts to Solid conventions - and every deliberate deviation is
        documented in the primitive&apos;s README. Beyond parity, a built-in{" "}
        <a href="#/motion">motion system</a> covers springs, layout morphs, and gestures in pure
        CSS.
      </p>
    </section>

    <footer class="site-footer">
      <span class="footer-brand">
        <span class="brand-mark" aria-hidden="true" />
        solidix
      </span>
      <span>
        MIT · A Solid 2 port of Radix Primitives · Not affiliated with Radix UI or WorkOS.
      </span>
    </footer>
  </div>
);

export default Landing;
