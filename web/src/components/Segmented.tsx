// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/Segmented.tsx
// Purpose:    A row of buttons of which exactly one is chosen, used to switch between views.

type Props<T extends string> = {
  options: { id: T; title: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
};

// The switch. options: the choices. value: the chosen one. onChange: called with the new choice.
// label: what the switch chooses, for screen readers.
export default function Segmented<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div className="inline-flex rounded-full bg-soft p-1" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            value === option.id ? "bg-card font-medium shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {option.title}
        </button>
      ))}
    </div>
  );
}
