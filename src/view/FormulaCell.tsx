interface Props {
  value: unknown;
  isError?: boolean;
}

export function FormulaCell({ value, isError }: Props) {
  if (value === '#ERROR' || isError) {
    return <span className="formula-error">#ERROR</span>;
  }
  return <span className="formula-value">{String(value ?? '')}</span>;
}
