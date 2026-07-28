type Tab<T extends string> = {
  key: T;
  label: string;
  badge?: number;
};

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            active === tab.key
              ? "border-forest text-forest"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {tab.label}
          {!!tab.badge && tab.badge > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-bold text-paper leading-none">
              {tab.badge > 99 ? "99+" : tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
