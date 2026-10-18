import { createSignal, onCleanup } from "solid-js";
import { Toast } from "solidix";

const ToastDemo = () => {
  const [open, setOpen] = createSignal(false);
  const [eventDate, setEventDate] = createSignal(new Date());
  let timerId = 0;

  onCleanup(() => window.clearTimeout(timerId));

  return (
    <Toast.Provider swipeDirection="right">
      <button
        class="Button large violet"
        type="button"
        onClick={() => {
          setOpen(false);
          window.clearTimeout(timerId);
          timerId = window.setTimeout(() => {
            setEventDate(oneWeekAway(new Date()));
            setOpen(true);
          }, 100);
        }}
      >
        Add to calendar
      </button>

      <Toast.Root class="ToastRoot" open={open()} onOpenChange={setOpen}>
        <Toast.Title class="ToastTitle">Scheduled: Catch up</Toast.Title>
        <Toast.Description asChild>
          <time class="ToastDescription" datetime={eventDate().toISOString()}>
            {prettyDate(eventDate())}
          </time>
        </Toast.Description>
        <Toast.Action class="ToastAction" asChild altText="Goto schedule to undo">
          <button class="Button small green" type="button">
            Undo
          </button>
        </Toast.Action>
      </Toast.Root>
      <Toast.Viewport class="ToastViewport" />
    </Toast.Provider>
  );
};

function oneWeekAway(date: Date): Date {
  const now = new Date(date);
  const inOneWeek = now.setDate(now.getDate() + 7);
  return new Date(inOneWeek);
}

function prettyDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export default ToastDemo;
