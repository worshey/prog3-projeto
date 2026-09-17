'use client'

import { useState } from 'react'
import {
  Bike,
  CreditCard,
  MapPin,
  MessageSquare,
  Pencil,
  Store,
  Trash2,
  User,
} from 'lucide-react'
import {
  type Pedido,
  FORMA_PAGAMENTO_LABEL,
  TIPO_ENTREGA_LABEL,
  formatBRL,
  formatDataHora,
} from '@/lib/pedidos'
import { MdButton, StatusChip, TopAppBar } from './md3'

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 py-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  )
}

export function OrderDetailScreen({
  pedido,
  onBack,
  onEdit,
  onDelete,
}: {
  pedido: Pedido
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [confirmando, setConfirmando] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col pb-28">
      <TopAppBar
        title={`Pedido #${pedido.numero}`}
        subtitle={formatDataHora(pedido.criadoEm)}
        onBack={onBack}
      />

      <div className="flex flex-col gap-4 px-4 pt-2">
        <div className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Total do pedido</p>
            <p className="text-2xl font-medium text-foreground">{formatBRL(pedido.valorTotal)}</p>
          </div>
          <StatusChip status={pedido.status} />
        </div>

        {/* Itens */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium text-foreground">Itens</h2>
          <ul className="flex flex-col divide-y divide-border">
            {pedido.itens.map((item) => (
              <li key={item.produtoId} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-foreground">
                  <span className="font-medium tabular-nums">{item.quantidade}×</span> {item.nome}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatBRL(item.preco * item.quantidade)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Dados */}
        <section className="rounded-2xl border border-border bg-card px-4 py-1">
          <div className="divide-y divide-border">
            <InfoRow icon={User} label="Cliente">
              {pedido.clienteNome}
            </InfoRow>

            <InfoRow
              icon={pedido.tipoEntrega === 'entrega' ? Bike : Store}
              label="Tipo de entrega"
            >
              {TIPO_ENTREGA_LABEL[pedido.tipoEntrega]}
              {pedido.entregador && (
                <span className="text-muted-foreground"> · {pedido.entregador}</span>
              )}
            </InfoRow>

            {pedido.endereco && (
              <InfoRow icon={MapPin} label="Endereço">
                <span>{pedido.endereco.texto}</span>
                <br />
                <span className="text-muted-foreground">CEP {pedido.endereco.cep}</span>
              </InfoRow>
            )}

            <InfoRow icon={CreditCard} label="Forma de pagamento">
              {FORMA_PAGAMENTO_LABEL[pedido.formaPagamento]}
            </InfoRow>

            <InfoRow icon={MessageSquare} label="Observação">
              {pedido.observacao}
            </InfoRow>
          </div>
        </section>
      </div>

      {/* Ações fixas */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-3">
          <MdButton variant="outlined" destructive icon={Trash2} onClick={() => setConfirmando(true)}>
            Excluir
          </MdButton>
          <MdButton icon={Pencil} onClick={onEdit} className="flex-1">
            Editar
          </MdButton>
        </div>
      </div>

      {/* Diálogo de confirmação de exclusão */}
      {confirmando && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          onClick={() => setConfirmando(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="size-6" />
            </div>
            <h3 id="confirm-title" className="text-lg font-medium text-foreground">
              Excluir pedido #{pedido.numero}?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. O pedido de {pedido.clienteNome} será removido
              permanentemente.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <MdButton variant="text" onClick={() => setConfirmando(false)}>
                Cancelar
              </MdButton>
              <MdButton variant="filled" destructive onClick={onDelete}>
                Excluir
              </MdButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
