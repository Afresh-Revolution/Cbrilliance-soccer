'use client';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdminConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  error = null,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="admin-modal admin-confirm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
      aria-describedby="admin-confirm-message"
    >
      <div className="admin-modal__backdrop" onClick={busy ? undefined : onCancel} aria-hidden />
      <div className="admin-modal__panel admin-confirm__panel">
        <div className="admin-confirm__icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 id="admin-confirm-title" className="admin-confirm__title">
          {title}
        </h2>
        <p id="admin-confirm-message" className="admin-confirm__message">
          {message}
        </p>
        {error && (
          <p className="admin-confirm__error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-confirm__actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn--outline admin-confirm__confirm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
