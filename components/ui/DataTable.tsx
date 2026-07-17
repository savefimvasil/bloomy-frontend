import type { ReactNode } from "react";

export interface TableColumn<T> {
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

export function DataTable<T>({ columns, rows, rowKey }: DataTableProps<T>) {
  const lastIdx = columns.length - 1;
  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={i}
              className={[
                "pb-1 text-hint font-semibold uppercase tracking-widest text-muted",
                col.align === "right" ? "text-right" : "text-left",
                i < lastIdx ? "pr-4" : "",
              ].filter(Boolean).join(" ")}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={rowKey(row)} className="border-t border-line/50">
            {columns.map((col, i) => (
              <td
                key={i}
                className={[
                  "py-2",
                  col.align === "right" ? "text-right" : "",
                  i < lastIdx ? "pr-4" : "",
                ].filter(Boolean).join(" ")}
              >
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
