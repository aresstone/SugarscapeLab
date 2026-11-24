// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/simulate/SettingsForm.tsx
// Purpose:    The settings of the Simulate page: a row of presets that load any required run, the fields
//             for the settings that can be changed, and the Run button.

import type { ReactNode } from "react";
import { LoaderCircle, Play } from "lucide-react";
import type { Coursework, Settings } from "../../lib/api";
import type { Facts } from "../../lib/results";
import type { RunForm } from "../../lib/run-store";

// The form of a saved run: its settings over the defaults, the reference seed, and its number of steps.
// facts: the runs and defaults. coursework: the coursework the run belongs to. name: the run's name.
export function presetForm(facts: Facts, coursework: Coursework, name: string): RunForm {
  const run = coursework.runs.find((item) => item.name === name)!;
  const settings = { ...pickEditable(facts), ...run.settings, seed: coursework.repeat_seeds[0] } as Settings;
  return { settings, steps: run.steps, source: { coursework: coursework.id, run: name, title: run.title } };
}

// The default value of every setting the page can change. facts: the defaults.
function pickEditable(facts: Facts): Settings {
  const settings: Record<string, number | boolean> = {};
  facts.editable.forEach((name) => (settings[name] = facts.defaults[name]));
  return settings as Settings;
}

// A labelled number field. label: the name shown. value: the number. onChange: called with the new number.
// min, max, step: the allowed values. disabled: greys the field out. hint: a short line under it.
function NumberField(props: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className={`block ${props.disabled ? "opacity-50" : ""}`}>
      <span className="text-xs font-medium text-muted">{props.label}</span>
      <input
        type="number"
        value={Number.isNaN(props.value) ? "" : props.value}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.value === "" ? NaN : Number(event.target.value))}
        className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-1.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
      {props.hint && <span className="mt-0.5 block text-[11px] text-muted">{props.hint}</span>}
    </label>
  );
}

// An on/off switch with a label, drawn like the Detail switch in the settings menu.
// label: the name shown. on: whether it is on. onChange: called with the new state. children: a note under it.
function Toggle({ label, on, onChange, children }: { label: string; on: boolean; onChange: (on: boolean) => void; children?: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          onClick={() => onChange(!on)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-action" : "bg-line"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      {children}
    </div>
  );
}

type Props = { facts: Facts; form: RunForm; onChange: (form: RunForm) => void; onRun: () => void; running: boolean };

// The presets, the fields and the Run button. Changing any field turns the settings into custom ones.
// facts: the runs, defaults and limits. form: the current settings. onChange: called with new settings.
// onRun: called by the Run button. running: true while the server is running the model.
export default function SettingsForm({ facts, form, onChange, onRun, running }: Props) {
  const { settings } = form;
  const limits = facts.limits;
  // Changes one setting, which makes the settings custom ones.
  // name: the setting. value: its new value.
  const set = (name: keyof Settings, value: number | boolean) =>
    onChange({ ...form, settings: { ...settings, [name]: value }, source: null });

  return (
    <div className="card p-5" data-tour="settings-form">
      <div data-tour="presets">
        <p className="text-sm font-semibold">Load a required run</p>
        <div className="mt-2 space-y-2">
          {facts.courseworks.map((coursework) => (
            <div key={coursework.id} className="flex flex-wrap items-center gap-1.5">
              <span className="w-24 shrink-0 text-xs text-muted">{coursework.title}</span>
              {coursework.runs.map((run) => {
                const chosen = form.source?.coursework === coursework.id && form.source.run === run.name;
                return (
                  <button
                    key={run.name}
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => onChange(presetForm(facts, coursework, run.name))}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      chosen ? "border-action bg-action/10 font-medium text-ink" : "border-line text-muted hover:bg-soft hover:text-ink"
                    }`}
                  >
                    {run.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {form.source
            ? `Loaded: ${form.source.title}, with its reference seed. Run it to compare the result with its saved files.`
            : "Custom settings: they match no saved run."}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-5">
        <NumberField label="Number of agents" value={settings.num_agents} min={1} max={limits.max_agents}
          onChange={(v) => set("num_agents", v)} hint={`1 to ${limits.max_agents}`} />
        <NumberField label="Number of steps" value={form.steps} min={1} max={limits.max_steps}
          onChange={(v) => onChange({ ...form, steps: v, source: null })} hint={`1 to ${limits.max_steps}`} />
        <NumberField label="Regrowth rate" value={settings.regrowth_rate} min={0} max={limits.max_regrowth} step={0.25}
          onChange={(v) => set("regrowth_rate", v)} hint="sugar per cell per step" />
        <NumberField label="Patches that never regrow" value={settings.no_regrow_patches} min={0} max={limits.sugary_cells}
          onChange={(v) => set("no_regrow_patches", v)} hint={`of the ${limits.sugary_cells} cells with sugar`} />
        <NumberField label="Seed" value={settings.seed} min={0} max={2147483647}
          onChange={(v) => set("seed", v)} hint="same seed, same run" />
        <NumberField label="Shortest vision" value={settings.vision_min} min={1} max={limits.max_vision}
          onChange={(v) => set("vision_min", v)} hint="cells" />
        <NumberField label="Longest vision" value={settings.vision_max} min={1} max={limits.max_vision}
          onChange={(v) => set("vision_max", v)} hint="cells" />
        <div className="pt-1">
          <Toggle label="Lifespan" on={settings.lifespan} onChange={(on) => set("lifespan", on)} />
          <span className="mt-1 block text-[11px] text-muted">death of old age</span>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-x-4">
          <div className="pt-1">
            <Toggle label="Reproduction" on={settings.reproduction} onChange={(on) => set("reproduction", on)} />
            <span className="mt-1 block text-[11px] text-muted">children of rich agents</span>
          </div>
          <NumberField label="Reproduction threshold" value={settings.reproduction_threshold} min={1}
            max={limits.max_threshold} disabled={!settings.reproduction}
            onChange={(v) => set("reproduction_threshold", v)} hint="sugar needed for a child" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button type="button" className="btn-primary" onClick={onRun} disabled={running} data-tour="run-button">
          {running ? <LoaderCircle size={16} className="animate-spin" /> : <Play size={16} />}
          {running ? "Running on the server…" : "Run"}
        </button>
        <span className="text-xs text-muted">The server runs the model in assignment/sugarscape.py and sends back every step.</span>
      </div>
    </div>
  );
}
