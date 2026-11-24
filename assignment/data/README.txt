Files in this folder (all written by run_simulations.py)

<name>_agents.csv  Reference seed: one row per living agent per step.
<name>_steps.csv   Reference seed: one row per step.
repeats.csv        One row per run and seed, with summary numbers.

Agent columns: step; agent_id; x (column), y (row); sugar held; vision (cells seen);
  metabolism (sugar burned per step); age (steps lived); founder_id (starting ancestor).
Step columns: step (0 = start); population (living agents); births, deaths_starved,
  deaths_old_age, sugar_collected (counted during that step); mean_sugar and
  median_sugar (of living agents); gini (inequality of agent sugar); sugar_on_grid
  (total sugar on the cells); mean_vision, mean_metabolism (of living agents);
  share_on_rich_cells (share of agents on cells with capacity 3 or 4);
  founders_alive (number of different founder_id among living agents).
Repeats columns: run; seed; steps; final_population; population_last50, mean_sugar_last50
  and gini_last50 (averages over the last 50 steps); total_births; deaths_starved and
  deaths_old_age (totals over the run); mean_vision_final, mean_metabolism_final and
  founders_alive_final (at the last step).

Runs: 01_base_100, 02_base_500, 03_scenario1_regrowth_slow, 04_scenario1_regrowth_fast, 05_scenario2_no_regrow_patches, 06_scenario3_vision_short, 07_scenario3_vision_long, 08_modification_lifespan, 09_modification_reproduction, 10_modification_lifespan_reproduction
