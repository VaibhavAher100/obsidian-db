interface Props {
  value: unknown;
}

export function FormulaCell({ value }: Props) {
  if (value === '#ERROR') {
    return <span className="obsidian-db-formula-error">#ERROR</span>;
  }
  return <span className="obsidian-db-formula-cell">{String(value ?? '')}</span>;
}
