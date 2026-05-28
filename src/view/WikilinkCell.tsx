interface Props {
  value: string;
}

export function WikilinkCell({ value }: Props) {
  const match = value.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
  if (!match) return <span>{value}</span>;
  const displayText = match[2] ?? match[1] ?? value;
  const linkTarget = match[1] ?? '';
  return (
    <span className="internal-link" data-link={linkTarget}>
      {displayText}
    </span>
  );
}
