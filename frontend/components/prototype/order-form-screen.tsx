'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import {
  CARDAPIO,
  ENTREGADORES,
  type FormaPagamento,
  type ItemPedido,
  type Pedido,
  type StatusPedido,
  type TipoEntrega,
  STATUS_ORDER,
  STATUS_LABEL,
  formatBRL,
} from '@/lib/pedidos'
import {
  MdButton,
  SegmentedButtons,
  SelectField,
  TextArea,
  TextField,
  TopAppBar,
} from './md3'

type FormErros = {
  clienteNome?: string
  itens?: string
  cep?: string
  enderecoTexto?: string
  observacao?: string
}

export function OrderFormScreen({
  pedido,
  onCancel,
  onSave,
}: {
  pedido?: Pedido | null
  onCancel: () => void
  onSave: (dados: Omit<Pedido, 'id' | 'numero' | 'criadoEm'>) => void
}) {
  const editando = !!pedido

  const [clienteNome, setClienteNome] = useState(pedido?.clienteNome ?? '')
  const [itens, setItens] = useState<ItemPedido[]>(pedido?.itens ?? [])
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>(pedido?.tipoEntrega ?? 'entrega')
  const [cep, setCep] = useState(pedido?.endereco?.cep ?? '')
  const [enderecoTexto, setEnderecoTexto] = useState(pedido?.endereco?.texto ?? '')
  const [status, setStatus] = useState<StatusPedido>(pedido?.status ?? 'recebido')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(
    pedido?.formaPagamento ?? 'pix',
  )
  const [observacao, setObservacao] = useState(pedido?.observacao ?? '')
  const [entregador, setEntregador] = useState(pedido?.entregador ?? ENTREGADORES[0])
  const [produtoSel, setProdutoSel] = useState(CARDAPIO[0].id)
  const [erros, setErros] = useState<FormErros>({})
  const [salvando, setSalvando] = useState(false)

  const valorTotal = useMemo(
    () => itens.reduce((s, i) => s + i.preco * i.quantidade, 0),
    [itens],
  )

  function adicionarProduto() {
    const prod = CARDAPIO.find((p) => p.id === produtoSel)
    if (!prod) return
    setItens((atual) => {
      const existente = atual.find((i) => i.produtoId === prod.id)
      if (existente) {
        return atual.map((i) =>
          i.produtoId === prod.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        )
      }
      return [...atual, { produtoId: prod.id, nome: prod.nome, quantidade: 1, preco: prod.preco }]
    })
  }

  function alterarQtd(id: string, delta: number) {
    setItens((atual) =>
      atual
        .map((i) => (i.produtoId === id ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0),
    )
  }

  function removerItem(id: string) {
    setItens((atual) => atual.filter((i) => i.produtoId !== id))
  }

  function validar(): FormErros {
    const e: FormErros = {}
    if (clienteNome.trim().length < 2) e.clienteNome = 'Informe o nome do cliente.'
    if (itens.length === 0) e.itens = 'Adicione ao menos um item ao pedido.'
    if (tipoEntrega === 'entrega') {
      if (!/^\d{5}-?\d{3}$/.test(cep.trim())) e.cep = 'Informe um CEP válido (00000-000).'
      if (enderecoTexto.trim().length < 5) e.enderecoTexto = 'Informe o endereço de entrega.'
    }
    if (observacao.trim().length === 0) e.observacao = 'A observação é obrigatória.'
    return e
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    const e = validar()
    setErros(e)
    if (Object.keys(e).length > 0) return
    setSalvando(true)
    setTimeout(() => {
      onSave({
        clienteNome: clienteNome.trim(),
        itens,
        tipoEntrega,
        endereco:
          tipoEntrega === 'entrega'
            ? { clienteNome: clienteNome.trim(), cep: cep.trim(), texto: enderecoTexto.trim() }
            : null,
        status,
        formaPagamento,
        observacao: observacao.trim(),
        valorTotal,
        entregador: tipoEntrega === 'entrega' ? entregador : null,
      })
    }, 900)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopAppBar title={editando ? 'Editar pedido' : 'Novo pedido'} onBack={onCancel} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5 px-4 pb-28 pt-2">
        <TextField
          label="Nome do cliente"
          placeholder="Ex.: Ana Beatriz Souza"
          value={clienteNome}
          onChange={(e) => setClienteNome(e.target.value)}
          error={erros.clienteNome}
          required
        />

        {/* Itens */}
        <section className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">
            Itens do pedido<span className="ml-0.5 text-destructive">*</span>
          </span>

          <div className="flex items-end gap-2">
            <SelectField
              label=""
              aria-label="Produto do cardápio"
              value={produtoSel}
              onChange={(e) => setProdutoSel(e.target.value)}
              className="flex-1"
            >
              {CARDAPIO.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {formatBRL(p.preco)}
                </option>
              ))}
            </SelectField>
            <MdButton variant="tonal" icon={Plus} onClick={adicionarProduto} className="h-12">
              Adicionar
            </MdButton>
          </div>

          {erros.itens && <p className="text-xs font-medium text-destructive">{erros.itens}</p>}

          {itens.length > 0 && (
            <ul className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2">
              {itens.map((item) => (
                <li key={item.produtoId} className="flex items-center gap-2 rounded-xl px-2 py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBRL(item.preco)} · un.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => alterarQtd(item.produtoId, -1)}
                      aria-label={`Diminuir ${item.nome}`}
                      className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() => alterarQtd(item.produtoId, 1)}
                      aria-label={`Aumentar ${item.nome}`}
                      className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerItem(item.produtoId)}
                    aria-label={`Remover ${item.nome}`}
                    className="flex size-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <SegmentedButtons<TipoEntrega>
          label="Tipo de entrega"
          required
          value={tipoEntrega}
          onChange={setTipoEntrega}
          options={[
            { value: 'entrega', label: 'Entrega' },
            { value: 'retirada', label: 'Retirada' },
          ]}
        />

        {/* Endereço só para entrega */}
        {tipoEntrega === 'entrega' && (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-sm font-medium text-foreground">Endereço de entrega</p>
            <TextField
              label="CEP"
              placeholder="00000-000"
              inputMode="numeric"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              error={erros.cep}
              required
            />
            <TextField
              label="Endereço"
              placeholder="Rua, número, complemento e bairro"
              value={enderecoTexto}
              onChange={(e) => setEnderecoTexto(e.target.value)}
              error={erros.enderecoTexto}
              required
            />
            <SelectField
              label="Entregador responsável"
              value={entregador ?? ''}
              onChange={(e) => setEntregador(e.target.value)}
            >
              {ENTREGADORES.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </SelectField>
          </div>
        )}

        <SegmentedButtons<FormaPagamento>
          label="Forma de pagamento"
          required
          value={formaPagamento}
          onChange={setFormaPagamento}
          options={[
            { value: 'dinheiro', label: 'Dinheiro' },
            { value: 'cartão', label: 'Cartão' },
            { value: 'pix', label: 'Pix' },
          ]}
        />

        <SelectField
          label="Status"
          required
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusPedido)}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </SelectField>

        <TextArea
          label="Observação"
          placeholder="Ex.: Sem cebola, troco para R$ 100…"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          error={erros.observacao}
          required
        />
      </form>

      {/* Barra inferior fixa com total e salvar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Valor total</p>
            <p className="text-lg font-medium text-foreground">{formatBRL(valorTotal)}</p>
          </div>
          <MdButton variant="text" onClick={onCancel}>
            Cancelar
          </MdButton>
          <MdButton onClick={handleSubmit} disabled={salvando}>
            {salvando ? (
              <>
                <Loader2 className="size-[18px] animate-spin" />
                Salvando…
              </>
            ) : editando ? (
              'Salvar alterações'
            ) : (
              'Criar pedido'
            )}
          </MdButton>
        </div>
      </div>
    </div>
  )
}
