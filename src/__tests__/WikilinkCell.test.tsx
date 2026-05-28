import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WikilinkCell } from '../view/WikilinkCell';

describe('WikilinkCell', () => {
  it('renders wikilink target as internal-link span', () => {
    render(<WikilinkCell value="[[MyNote]]" />);
    const el = screen.getByText('MyNote');
    expect(el.className).toContain('internal-link');
  });

  it('renders display text when pipe alias present', () => {
    render(<WikilinkCell value="[[MyNote|Display Name]]" />);
    expect(screen.getByText('Display Name')).toBeDefined();
    expect(screen.queryByText('MyNote')).toBeNull();
  });

  it('renders plain text for non-wikilink values', () => {
    const { container } = render(<WikilinkCell value="just text" />);
    expect(screen.getByText('just text')).toBeDefined();
    expect(container.querySelector('.internal-link')).toBeNull();
  });

  it('renders plain text for empty string', () => {
    render(<WikilinkCell value="" />);
    expect(screen.getByText('', { selector: 'span' })).toBeDefined();
  });
});
