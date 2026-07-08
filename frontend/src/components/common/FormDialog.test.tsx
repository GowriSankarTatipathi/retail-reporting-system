import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormDialog } from './FormDialog';

describe('FormDialog', () => {
  it('closes immediately on Cancel when the form has no unsaved changes', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <FormDialog open title="New category" onClose={onClose} onSubmit={vi.fn()} isDirty={false}>
        <div>form fields</div>
      </FormDialog>
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/discard unsaved changes/i)).not.toBeInTheDocument();
  });

  it('asks for confirmation before discarding when the form is dirty', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <FormDialog open title="New category" onClose={onClose} onSubmit={vi.fn()} isDirty={true}>
        <div>form fields</div>
      </FormDialog>
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(/discard unsaved changes/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /discard/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
