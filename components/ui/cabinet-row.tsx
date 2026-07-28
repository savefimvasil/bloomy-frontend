type CabinetCardProps = {
  header?: React.ReactNode;
  meta?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
};

export function CabinetCard({ header, meta, body, footer }: CabinetCardProps) {
  return (
    <div className="py-6 flex flex-col gap-2">
      {header && <div className="flex flex-wrap items-center gap-3">{header}</div>}
      {meta && <div className="flex flex-wrap items-center gap-3">{meta}</div>}
      {body && <p className="text-body text-muted line-clamp-2 leading-relaxed">{body}</p>}
      {footer}
    </div>
  );
}

type CabinetRowProps = {
  thumbnail?: React.ReactNode;
  info: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

export function CabinetRow({ thumbnail, info, meta, actions }: CabinetRowProps) {
  return (
    <div className="group relative flex items-center gap-5 py-6">
      {thumbnail && (
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
          {thumbnail}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">{info}</div>
      {meta && (
        <p className="shrink-0 text-hint text-muted transition-opacity group-hover:opacity-0">
          {meta}
        </p>
      )}
      {actions && (
        <div className="absolute right-0 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {actions}
        </div>
      )}
    </div>
  );
}
