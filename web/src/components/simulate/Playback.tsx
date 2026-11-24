// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/simulate/Playback.tsx
// Purpose:    The playback controls under the world: play and pause, one step back and forward, the speed,
//             and a slider over the steps.

import { Pause, Play, StepBack, StepForward } from "lucide-react";
import Segmented from "../Segmented";

// The speeds offered, in frames per second.
export type Speed = "slow" | "normal" | "fast";
export const FRAMES_PER_SECOND: Record<Speed, number> = { slow: 3, normal: 10, fast: 30 };
const SPEEDS: { id: Speed; title: string }[] = [
  { id: "slow", title: "Slow" },
  { id: "normal", title: "Normal" },
  { id: "fast", title: "Fast" },
];

type Props = {
  index: number;
  count: number;
  step: number;
  lastStep: number;
  playing: boolean;
  speed: Speed;
  onIndex: (index: number) => void;
  onPlaying: (playing: boolean) => void;
  onSpeed: (speed: Speed) => void;
};

// The controls. index: the frame shown. count: how many frames there are. step, lastStep: the step
// number shown and the last one. playing: whether it is playing. speed: the speed chosen.
// onIndex, onPlaying, onSpeed: called when a control changes.
export default function Playback({ index, count, step, lastStep, playing, speed, onIndex, onPlaying, onSpeed }: Props) {
  const button = "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card hover:bg-soft disabled:opacity-40";
  return (
    <div className="mt-4 space-y-3" data-tour="playback">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={button} aria-label="One step back" disabled={index === 0} onClick={() => onIndex(index - 1)}>
          <StepBack size={16} />
        </button>
        <button
          type="button"
          className="btn-primary !px-4"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            if (!playing && index === count - 1) onIndex(0); // play again from the start
            onPlaying(!playing);
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={button} aria-label="One step forward" disabled={index === count - 1} onClick={() => onIndex(index + 1)}>
          <StepForward size={16} />
        </button>
        <span className="ml-auto text-sm tabular-nums text-muted" data-step={step}>
          Step {step} of {lastStep}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={count - 1}
        value={index}
        onChange={(event) => onIndex(Number(event.target.value))}
        aria-label="Step shown"
        className="w-full accent-[var(--action)]"
      />
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">Speed</span>
        <Segmented options={SPEEDS} value={speed} onChange={onSpeed} label="Playback speed" />
      </div>
    </div>
  );
}
