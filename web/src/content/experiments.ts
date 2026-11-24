// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/experiments.ts
// Purpose:    The text of the Experiments page: how the two briefs group the runs, and what each run
//             changes from the original model, written in words from its settings (never typed in).

import type { CourseworkId, Settings } from "../lib/api";

// A group of runs as a brief groups them: its title, one plain sentence, and the run names in order.
export type RunGroup = { title: string; text: string; runs: string[] };

export const RUN_GROUPS: Record<CourseworkId, RunGroup[]> = {
  assignment: [
    {
      title: "The original model",
      text: "The model with its default settings, at two starting population sizes.",
      runs: ["01_base_100", "02_base_500"],
    },
    {
      title: "Breaking the model",
      text: "Three scenarios, each changing one thing about the world or the agents. Each is compared with the original run of the same size.",
      runs: [
        "03_scenario1_regrowth_slow",
        "04_scenario1_regrowth_fast",
        "05_scenario2_no_regrow_patches",
        "06_scenario3_vision_short",
        "07_scenario3_vision_long",
      ],
    },
    {
      title: "Additions",
      text: "Two new rules, a maximum lifespan and reproduction, alone and together. Each is compared with the original run of the same size.",
      runs: ["08_modification_lifespan", "09_modification_reproduction", "10_modification_lifespan_reproduction"],
    },
  ],
  project: [
    {
      title: "The Project's three runs",
      text: "A base run, then reproduction and death, then reproduction and death with sugar that grows back more slowly.",
      runs: ["01_base_100", "02_reproduction_death", "03_reproduction_death_scarce"],
    },
  ],
};

// Says in words what a run changes from the original model, one phrase per change.
// settings: the settings that differ from the defaults (as in RUNS). defaults: DEFAULT_SETTINGS.
export function describeChanges(settings: Partial<Settings>, defaults: Settings & Record<string, number | boolean>): string[] {
  const changes: string[] = [];
  const has = (name: keyof Settings) => settings[name] !== undefined && settings[name] !== defaults[name];
  if (has("num_agents")) changes.push(`${settings.num_agents} agents at the start (the original has ${defaults.num_agents}).`);
  if (has("regrowth_rate"))
    changes.push(`Sugar grows back by ${settings.regrowth_rate} per step on each cell (the original: ${defaults.regrowth_rate}).`);
  if (has("no_regrow_patches"))
    changes.push(`${settings.no_regrow_patches} cells that hold sugar never grow it back once eaten (the original: none).`);
  if (has("vision_min") || has("vision_max"))
    changes.push(
      `Each agent sees from ${settings.vision_min ?? defaults.vision_min} to ${settings.vision_max ?? defaults.vision_max} cells ` +
        `(the original: ${defaults.vision_min} to ${defaults.vision_max}).`,
    );
  if (has("lifespan"))
    changes.push(
      `Lifespan on: each agent dies of old age at a maximum age drawn from ${defaults.max_age_min} to ${defaults.max_age_max} steps.`,
    );
  if (has("reproduction"))
    changes.push(
      `Reproduction on: an agent with at least ${settings.reproduction_threshold ?? defaults.reproduction_threshold} sugar and an ` +
        `empty neighbouring cell places a child there and gives it half its sugar.`,
    );
  if (changes.length === 0) changes.push("Nothing: this is the original model with its default settings.");
  return changes;
}
