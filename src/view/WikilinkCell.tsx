import type { App } from 'obsidian';

interface Props {
  value: string;
  app: App;
}

export function WikilinkCell({ value, app }: Props) {
  const match = value.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
  if (!match) return <span>{value}</span>;
  const displayText = match[2] ?? match[1] ?? value;
  const linkTarget = match[1] ?? '';
  return (
    <span
      className="internal-link"
      data-link={linkTarget}
      onClick={() => { void app.workspace.openLinkText(linkTarget, '', false); }}
      style={{ cursor: 'pointer' }}
    >
      {displayText}
    </span>
  );
}
