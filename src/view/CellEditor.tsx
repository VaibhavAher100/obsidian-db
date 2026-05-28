import { useState } from 'react';

interface Props {
  initial: unknown;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

export function CellEditor({ initial, onCommit, onCancel }: Props) {
  const [value, setValue] = useState(String(initial ?? ''));

  return (
    <input
      autoFocus
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={e => {
        if (e.key === 'Enter') onCommit(value);
        if (e.key === 'Escape') onCancel();
      }}
    />
  );
}
