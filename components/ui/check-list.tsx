type CheckListProps = {
  items: string[];
};

export function CheckList({ items }: CheckListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-ink">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-forest">
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
