import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/constants';
import type { ContentStatus } from '@/lib/types';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand', className)} />;
}

export function PageLoader({ label = 'লোড হচ্ছে…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-brand-accent" />
      <p className="text-sm font-medium text-red-800">{message}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry} type="button">
          আবার চেষ্টা করুন
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title, description, action,
}: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const cls =
    status === 'PUBLISHED' ? 'badge-published' : status === 'DRAFT' ? 'badge-draft' : 'badge-archived';
  return <span className={cls}>{STATUS_LABELS[status]}</span>;
}

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brand">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({
  open, onClose, title, children, footer, wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
      <div
        className={cn('w-full rounded-2xl bg-white shadow-xl', wide ? 'max-w-4xl' : 'max-w-lg')}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-brand">{title}</h2>
          <button className="btn-ghost p-1" onClick={onClose} type="button" aria-label="বন্ধ করুন">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'হ্যাঁ, মুছে ফেলুন', onConfirm, onCancel, loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel} type="button">বাতিল</button>
          <button className="btn-danger" onClick={onConfirm} type="button" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 text-white" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

export function Field({
  label, error, hint, required, children,
}: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="label">
        {label} {required && <span className="text-brand-accent">*</span>}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export function Pagination({
  meta, onPage,
}: { meta?: { page: number; totalPages: number; total: number }; onPage: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-slate-500">মোট {meta.total} টি</p>
      <div className="flex items-center gap-2">
        <button
          className="btn-secondary" type="button"
          disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}
        >
          পূর্ববর্তী
        </button>
        <span className="px-2 text-slate-600">
          {meta.page} / {meta.totalPages}
        </span>
        <button
          className="btn-secondary" type="button"
          disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}
        >
          পরবর্তী
        </button>
      </div>
    </div>
  );
}
