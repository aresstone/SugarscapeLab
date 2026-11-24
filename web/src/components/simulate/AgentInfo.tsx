// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/simulate/AgentInfo.tsx
// Purpose:    Shows the agent that was clicked on the world: its vision, metabolism, sugar and age at the
//             step being shown.

import { MousePointerClick } from "lucide-react";
import type { Frame } from "../../lib/api";

type Props = { agentId: number | null; frame: Frame; traits: Record<string, [number, number]> };

// The details of the chosen agent, or a hint when none is chosen.
// agentId: the chosen agent (or null). frame: the step shown. traits: each agent's [vision, metabolism].
export default function AgentInfo({ agentId, frame, traits }: Props) {
  if (agentId === null)
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-muted" data-tour="agent-info">
        <MousePointerClick size={16} className="shrink-0" /> Click an agent (a blue dot) to see its vision, metabolism, sugar and age.
      </p>
    );
  const agent = frame.agents.find((item) => item[0] === agentId);
  const [vision, metabolism] = traits[String(agentId)] ?? [0, 0];
  if (!agent)
    return (
      <p className="mt-4 text-sm text-muted" data-tour="agent-info">
        Agent {agentId} is not alive at step {frame.step}.
      </p>
    );
  const facts: [string, string][] = [
    ["Vision", `${vision} cells`],
    ["Metabolism", `${metabolism} sugar per step`],
    ["Sugar", agent[3].toLocaleString("en-GB", { maximumFractionDigits: 2 })],
    ["Age", `${agent[4]} steps`],
  ];
  return (
    <div className="mt-4 rounded-2xl bg-soft p-4" data-tour="agent-info">
      <p className="text-sm font-semibold">
        Agent {agentId} <span className="font-normal text-muted">at ({agent[1]}, {agent[2]}), step {frame.step}</span>
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        {facts.map(([name, value]) => (
          <div key={name}>
            <dt className="text-xs text-muted">{name}</dt>
            <dd className="text-sm font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
