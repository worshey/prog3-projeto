'use client'

import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { ArrowLeft, ChevronDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StatusPedido } from '@/lib/pedidos'
import { STATUS_LABEL } from '@/lib/pedidos'

/* -------------------------------------------------------------------------- */
/*  Top app bar                                                               */
/* -------------------------------------------------------------------------- */

export function TopAppBar({
  title,
  onBack,
  trailing,
  subtitle,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  trailing?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-background/95 px-2 py-3 backdrop-blur">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary active:bg-secondary/70"
        >
          <ArrowLeft className="size-5" />
        </button>
      )}
      <div className={cn('min-w-0 flex-1', !onBack && 'pl-2')}>
        <h1 className="truncate text-xl font-medium leading-tight text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {trailing}
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Buttons                                                                   */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text'

export function MdButton({
  children,
  variant = 'filled',
  className,
  icon: Icon,
  type = 'button',
  fullWidth,
  destructive,
  ...props
}: {
  children: ReactNode
  variant?: ButtonVariant
  icon?: LucideIcon
  fullWidth?: boolean
  destructive?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-40'
  const variants: Record<ButtonVariant, string> = {
    filled: destructive
      ? 'bg-destructive text-primary-foreground hover:brightness-105 active:brightness-95'
      : 'bg-primary text-primary-foreground shadow-sm hover:brightness-105 active:brightness-95',
    tonal: 'bg-secondary text-secondary-foreground hover:brightness-95 active:brightness-95',
    outlined: cn(
      'border bg-transparent hover:bg-secondary/50',
      destructive ? 'border-destructive/40 text-destructive' : 'border-border text-primary',
    ),
    text: destructive
      ? 'bg-transparent px-4 text-destructive hover:bg-destructive/10'
      : 'bg-transparent px-4 text-primary hover:bg-secondary/60',
  }
  return (
    <button
      type={type}
      className={cn(base, variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {Icon && <Icon className="size-[18px]" />}
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Text fields                                                               */
/* -------------------------------------------------------------------------- */

export function TextField({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={cn(
          'h-12 w-full rounded-xl border bg-card px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70',
          error
            ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30'
            : 'border-input focus:border-primary focus:ring-2 focus:ring-primary/25',
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function TextArea({
  label,
  error,
  required,
  className,
  ...props
}: {
  label: string
  error?: string
  required?: boolean
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={!!error}
        className={cn(
          'w-full resize-none rounded-xl border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70',
          error
            ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30'
            : 'border-input focus:border-primary focus:ring-2 focus:ring-primary/25',
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

export function SelectField({
  label,
  error,
  required,
  children,
  className,
  ...props
}: {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          className={cn(
            'h-12 w-full appearance-none rounded-xl border bg-card px-4 pr-10 text-base text-foreground outline-none transition-colors',
            error
              ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30'
              : 'border-input focus:border-primary focus:ring-2 focus:ring-primary/25',
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Segmented buttons (MD3)                                                   */
/* -------------------------------------------------------------------------- */

export function SegmentedButtons<T extends string>({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label?: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      )}
      <div
        role="radiogroup"
        className="flex overflow-hidden rounded-full border border-border"
      >
        {options.map((opt, i) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex-1 px-3 py-2.5 text-sm font-medium transition-colors',
                i > 0 && 'border-l border-border',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary/60',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Status chip                                                               */
/* -------------------------------------------------------------------------- */

const STATUS_STYLES: Record<StatusPedido, string> = {
  recebido: 'bg-status-recebido-container text-status-recebido',
  'em preparo': 'bg-status-preparo-container text-status-preparo',
  'em rota': 'bg-status-rota-container text-status-rota',
  entregue: 'bg-status-entregue-container text-status-entregue',
}

export function StatusChip({ status, className }: { status: StatusPedido; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Filter chip                                                               */
/* -------------------------------------------------------------------------- */

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-accent text-accent-foreground'
          : 'border-border bg-card text-foreground hover:bg-secondary/60',
      )}
    >
      {children}
    </button>
  )
}
