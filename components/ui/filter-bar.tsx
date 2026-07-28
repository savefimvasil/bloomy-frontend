type FilterItem<T extends string> = {
  key: T;
  label: string;
  count?: number;
};

type FilterBarProps<T extends string> = {
  filters: FilterItem<T>[];
  active: T;
  onChange: (key: T) => void;
};

export function FilterBar<T extends string>({ filters, active, onChange }: FilterBarProps<T>) {
  return (
    <div className="mt-4 flex gap-1 border-b border-line pb-1">
      {filters.map(({ key, label, count }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isActive ? "bg-forest/8 text-forest" : "text-muted hover:text-ink"
            }`}
          >
            {label}
            {count != null && count > 0 && (
              <span className={`rounded-full px-1.5 text-hint ${
                isActive ? "bg-forest/15 text-forest" : "bg-mist text-muted"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
