import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { App } from 'obsidian';
import { WikilinkCell } from '../view/WikilinkCell';

const mockApp = { workspace: { openLinkText: vi.fn() } } as unknown as App;

describe('WikilinkCell', () => {
  it('renders wikilink target as internal-link span', () => {
    render(<WikilinkCell app={mockApp} value="[[MyNote]]" />);
    const el = screen.getByText('MyNote');
    expect(el.className).toContain('internal-link');
  });

  it('renders display text when pipe alias present', () => {
    render(<WikilinkCell app={mockApp} value="[[MyNote|Display Name]]" />);
    expect(screen.getByText('Display Name')).toBeDefined();
    expect(screen.queryByText('MyNote')).toBeNull();
  });

  it('renders plain text for non-wikilink values', () => {
    const { container } = render(<WikilinkCell app={mockApp} value="just text" />);
    expect(screen.getByText('just text')).toBeDefined();
    expect(container.querySelector('.internal-link')).toBeNull();
  });

  it('renders plain text for empty string', () => {
    render(<WikilinkCell app={mockApp} value="" />);
    expect(screen.getByText('', { selector: 'span' })).toBeDefined();
  });
});
