// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/content/glossary.ts
// Purpose:    The glossary on the last Learn page: each term with a one- or two-sentence meaning.

export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: "Agent", meaning: "One actor in the model: a creature with a position, some sugar, a vision, a metabolism and an age." },
  { term: "Agent-based model", meaning: "A program in which many agents each follow simple rules, so that the behaviour of the whole group can be watched." },
  { term: "Capacity", meaning: "The most sugar a cell can hold. It is highest on the two hills and 0 on the empty ground." },
  { term: "Regrowth rate", meaning: "How much sugar every cell gains at the start of each step, up to its capacity." },
  { term: "Patch that never regrows", meaning: "A cell whose sugar, once eaten, never comes back (the no_regrow_patches setting)." },
  { term: "Vision", meaning: "How many cells an agent can see along its row and column." },
  { term: "Metabolism", meaning: "How much sugar an agent burns each step just to stay alive." },
  { term: "Starvation", meaning: "Death when an agent's sugar falls to 0 or below." },
  { term: "Lifespan", meaning: "The addition in which agents also die of old age, at a maximum age drawn for each agent." },
  { term: "Reproduction", meaning: "The addition in which an agent with enough sugar places a child on an empty neighbouring cell and gives it half its sugar." },
  { term: "Founder", meaning: "A starting agent. Every child carries the founder_id of the starting agent it descends from." },
  { term: "Lineage", meaning: "All the agents that share one founder: a family line." },
  { term: "Step", meaning: "One turn of the whole world: sugar grows back, then every agent acts once. Step 0 is the start." },
  { term: "Seed", meaning: "The number that starts the random number generator. The same seed gives exactly the same run." },
  { term: "Reference seed", meaning: "The first seed of each coursework, whose run is saved in full in the CSV files." },
  { term: "Repeat", meaning: "The same run with another seed, used to see how much a result depends on chance." },
  { term: "Scenario", meaning: "A run of the same model with one setting changed, compared with the original run." },
  { term: "CSV file", meaning: "A plain text table: one row per line, with the values separated by commas." },
  { term: "Gini coefficient", meaning: "A number from 0 (everyone holds the same) towards 1 (one holds almost everything) that measures how unevenly sugar is shared." },
  { term: "Lorenz curve", meaning: "A line showing what share of all the sugar the poorest part of the agents holds, for every size of that part." },
  { term: "Median", meaning: "The middle value: half the agents hold less sugar than it, and half hold more." },
  { term: "Carrying capacity", meaning: "The largest population a place can feed for good, given how fast its food renews." },
  { term: "Emergence", meaning: "A pattern of the whole group that comes from simple rules but is written in none of them." },
  { term: "Selection", meaning: "The change in a population's traits because agents with some traits survive and have children more often." },
];
