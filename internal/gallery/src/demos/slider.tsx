import { Slider } from "soldix";

const SliderDemo = () => (
  <form>
    <Slider.Root class="SliderRoot" defaultValue={[50]} max={100} step={1}>
      <Slider.Track class="SliderTrack">
        <Slider.Range class="SliderRange" />
      </Slider.Track>
      <Slider.Thumb class="SliderThumb" aria-label="Volume" />
    </Slider.Root>
  </form>
);

export default SliderDemo;
