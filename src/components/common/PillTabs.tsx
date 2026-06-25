'use client';

interface PillTabsProps {
  items: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export default function PillTabs({ items, active, onChange }: PillTabsProps) {
  return (
    <div className="pill-tabs">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`pill-tabs__tab ${active === item.id ? 'pill-tabs__tab--active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
