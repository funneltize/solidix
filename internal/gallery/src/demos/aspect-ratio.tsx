import { AspectRatio } from "solidix";

const AspectRatioDemo = () => (
  <div class="Container">
    <AspectRatio.Root ratio={16 / 9}>
      <img
        class="Image"
        src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
        alt="Landscape photograph by Tobias Tullius"
      />
    </AspectRatio.Root>
  </div>
);

export default AspectRatioDemo;
