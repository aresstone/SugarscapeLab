// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/motion/Aurora.tsx
// Purpose:    The soft, slowly moving colour glows behind the top of every page. Their colours are
//             the gradient colours from the palette in src/index.css.

// The four clouds: colour, strength, place and size.
const CLOUDS = [
  { colour: "--brand-2", strength: 20, place: "-top-[30%] left-[18%] size-[62vh] blur-[110px]", delay: "0s" },
  { colour: "--brand-3", strength: 20, place: "-top-[10%] right-[12%] size-[52vh] blur-[110px]", delay: "-6s" },
  { colour: "--brand-1", strength: 14, place: "left-[46%] top-[22%] size-[40vh] blur-[120px]", delay: "-12s" },
  { colour: "--brand-1", strength: 12, place: "left-[6%] top-[30%] size-[34vh] blur-[110px]", delay: "-3s" },
];

// Four blurred clouds, fading into the page background at the bottom. No props.
export default function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden">
      {CLOUDS.map((cloud) => (
        <div
          key={cloud.place}
          className={`absolute animate-aurora rounded-full ${cloud.place}`}
          style={{
            backgroundColor: `color-mix(in oklch, var(${cloud.colour}) ${cloud.strength}%, transparent)`,
            animationDelay: cloud.delay,
          }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-page" />
    </div>
  );
}
