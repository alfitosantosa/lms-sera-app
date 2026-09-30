import { EntryPanel } from "@/components/entry/Entry";

/**
 * The aside every entry screen shares: the portal's substance shown, not
 * described. One demonstration, and nothing else — the claim lives in the
 * banner above the form (DESIGN.md §3).
 *
 * The register is deliberately illustrative — these are not real students, and
 * the caption says so (DESIGN.md §6).
 */
const REGISTER: {
  name: string;
  className: string;
  mark: string;
  chip: string;
}[] = [
  {
    name: "Ahmad Fauzan",
    className: "X IPA 1",
    mark: "H",
    chip: "bg-success-chip text-success-strong",
  },
  {
    name: "Nabila Zahra",
    className: "XI IPS 2",
    mark: "H",
    chip: "bg-success-chip text-success-strong",
  },
  {
    name: "Rizky Pratama",
    className: "XII TKJ 1",
    mark: "S",
    chip: "bg-warning-chip text-warning-strong",
  },
  {
    name: "Siti Aminah",
    className: "X AKL 2",
    mark: "I",
    chip: "bg-info-chip text-info-strong",
  },
  {
    name: "Hafiz Abdullah",
    className: "XI IPA 3",
    mark: "A",
    chip: "bg-destructive-chip text-destructive-strong",
  },
];

export function EntryAside() {
  return (
    <EntryPanel>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-navy-foreground text-sm font-semibold">
          Presensi
        </span>
        <span className="text-navy-muted text-xs">
          H hadir, S sakit, I izin, A alfa
        </span>
      </div>

      <div className="bg-card mt-6 rounded-2xl p-4">
        <ul className="space-y-1">
          {REGISTER.map((row) => (
            <li
              key={row.name}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 odd:bg-secondary/70"
            >
              <span className="flex-1 truncate text-sm">{row.name}</span>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {row.className}
              </span>
              <span
                className={`grid size-6 shrink-0 place-content-center rounded-lg text-xs font-semibold ${row.chip}`}
              >
                {row.mark}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground mt-3 text-xs">
          Contoh tampilan. Baris di atas bukan data siswa sungguhan.
        </p>
      </div>
    </EntryPanel>
  );
}
