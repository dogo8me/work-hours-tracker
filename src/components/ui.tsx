import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
}

export function Card({ children, className = '', glow }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-lg shadow-black/20 ${
        glow ? 'ring-1 ring-[var(--color-accent)]/20' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: ReactNode
  accent?: boolean
}

export function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-muted)]">{label}</span>
        <span
          className={`rounded-lg p-2 ${accent ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'bg-white/5 text-[var(--color-muted)]'}`}
        >
          {icon}
        </span>
      </div>
      <div>
        <div className={`text-2xl font-semibold tracking-tight ${accent ? 'text-[var(--color-accent)]' : ''}`}>
          {value}
        </div>
        {sub && <div className="mt-1 text-xs text-[var(--color-muted)]">{sub}</div>}
      </div>
    </Card>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-dim)] font-semibold',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-[var(--color-border)]',
    danger: 'bg-red-500/15 text-[var(--color-danger)] hover:bg-red-500/25 border border-red-500/30',
    ghost: 'text-[var(--color-muted)] hover:text-white hover:bg-white/5',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="text-[var(--color-muted)]">{label}</span>}
      <input
        className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-white outline-none transition focus:border-[var(--color-accent)]/50 focus:ring-2 focus:ring-[var(--color-accent)]/20 ${className}`}
        {...props}
      />
    </label>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="text-[var(--color-muted)]">{label}</span>}
      <textarea
        className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-white outline-none transition resize-none focus:border-[var(--color-accent)]/50 focus:ring-2 focus:ring-[var(--color-accent)]/20 ${className}`}
        {...props}
      />
    </label>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
