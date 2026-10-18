import { createSignal } from "solid-js";
// NOTE: neither `radix-ui` nor `solidix` re-exports Announce from the
// meta-package (parity) — importing the primitive directly.
import { Announce } from "@solidix/announce";

const AnnounceDemo = () => {
  const [count, setCount] = createSignal(0);
  return (
    <div class="AnnounceDemo">
      <div class="AnnounceCard">
        <div class="AnnounceHead">
          <span class="AnnounceDot" aria-hidden="true" />
          Live region · polite
        </div>
        <Announce
          regionIdentifier="gallery-notifications"
          type="polite"
          class="AnnounceMirror"
        >
          {count() === 0
            ? "No notifications yet."
            : `You have ${count()} notification${count() === 1 ? "" : "s"}.`}
        </Announce>
        <button type="button" class="Button violet" onClick={() => setCount((c) => c + 1)}>
          Notify{count() > 0 ? ` (${count()})` : ""}
        </button>
        <p class="Hint">Each update mirrors to a polite live region for screen readers.</p>
      </div>
    </div>
  );
};

export default AnnounceDemo;
