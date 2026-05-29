import { useRef, useState } from 'react';

interface Props {
  initial: unknown;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

export function CellEditor({ initial, onCommit, onCancel }: Props) {
  const [value, setValue] = useState(String(initial ?? ''));
  // Enter commits and unmounts the input, which also fires onBlur — guard so the
  // edit is only ever resolved once.
  const settled = useRef(false);

  const commit = (): void => {
    if (settled.current) return;
    settled.current = true;
    onCommit(value);
  };

  const cancel = (): void => {
    if (settled.current) return;
    settled.current = true;
    onCancel();
  };

  return (
    <input
      autoFocus
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') cancel();
      }}
    />
  );
}
