import { HoverCard } from "solidix";

const AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%23c2410c'/%3E%3Crect x='54' y='54' width='30' height='30' rx='7' fill='white'/%3E%3C/svg%3E";

const HoverCardDemo = () => (
  <HoverCard.Root>
    <HoverCard.Trigger asChild>
      <a
        class="ImageTrigger"
        href="https://github.com/eggfloat/solidix"
        target="_blank"
        rel="noreferrer noopener"
      >
        <img class="Image normal" src={AVATAR} alt="solidix" />
      </a>
    </HoverCard.Trigger>
    <HoverCard.Portal>
      <HoverCard.Content class="HoverCardContent" sideOffset={5}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "7px" }}>
          <img class="Image large" src={AVATAR} alt="solidix" />
          <div style={{ display: "flex", "flex-direction": "column", gap: "15px" }}>
            <div>
              <div class="Text bold">solidix</div>
              <div class="Text faded">@solidix</div>
            </div>
            <div class="Text">
              Accessible, unstyled UI primitives for Solid 2. Free and open-source.
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
              <div style={{ display: "flex", gap: "5px" }}>
                <div class="Text bold">31</div> <div class="Text faded">Primitives</div>
              </div>
              <div style={{ display: "flex", gap: "5px" }}>
                <div class="Text bold">MIT</div> <div class="Text faded">License</div>
              </div>
            </div>
          </div>
        </div>

        <HoverCard.Arrow class="HoverCardArrow" />
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
);

export default HoverCardDemo;
