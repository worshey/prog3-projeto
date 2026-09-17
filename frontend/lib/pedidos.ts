export type StatusPedido = 'recebido' | 'em preparo' | 'em rota' | 'entregue'
export type TipoEntrega = 'retirada' | 'entrega'
export type FormaPagamento = 'dinheiro' | 'cartão' | 'pix'

export type ItemPedido = {
  produtoId: string
  nome: string
  quantidade: number
  preco: number
}

export type Endereco = {
  clienteNome: string
  cep: string
  texto: string
}

export type Pedido = {
  id: string
  numero: number
  clienteNome: string
  itens: ItemPedido[]
  tipoEntrega: TipoEntrega
  endereco: Endereco | null
  status: StatusPedido
  formaPagamento: FormaPagamento
  observacao: string
  valorTotal: number
  entregador: string | null
  criadoEm: string // ISO date
}

export type ProdutoCardapio = {
  id: string
  nome: string
  preco: number
}

export const CARDAPIO: ProdutoCardapio[] = [
  { id: 'p1', nome: 'Pizza Margherita', preco: 45.9 },
  { id: 'p2', nome: 'Pizza Calabresa', preco: 48.5 },
  { id: 'p3', nome: 'Pizza Quatro Queijos', preco: 52.0 },
  { id: 'p4', nome: 'Pizza Portuguesa', preco: 50.0 },
  { id: 'p5', nome: 'Pizza Frango com Catupiry', preco: 51.5 },
  { id: 'p6', nome: 'Pizza Pepperoni', preco: 54.9 },
  { id: 'p7', nome: 'Refrigerante 2L', preco: 12.0 },
  { id: 'p8', nome: 'Borda Recheada', preco: 8.0 },
]

export const ENTREGADORES = ['Marcos Vinícius', 'Juliana Alves', 'Pedro Henrique', 'Retirada no balcão']

export const STATUS_ORDER: StatusPedido[] = ['recebido', 'em preparo', 'em rota', 'entregue']

export const STATUS_LABEL: Record<StatusPedido, string> = {
  recebido: 'Recebido',
  'em preparo': 'Em preparo',
  'em rota': 'Em rota',
  entregue: 'Entregue',
}

export const TIPO_ENTREGA_LABEL: Record<TipoEntrega, string> = {
  retirada: 'Retirada',
  entrega: 'Entrega',
}

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartão: 'Cartão',
  pix: 'Pix',
}

export function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const PEDIDOS_EXEMPLO: Pedido[] = [
  {
    id: 'ped-1042',
    numero: 1042,
    clienteNome: 'Ana Beatriz Souza',
    itens: [
      { produtoId: 'p1', nome: 'Pizza Margherita', quantidade: 1, preco: 45.9 },
      { produtoId: 'p7', nome: 'Refrigerante 2L', quantidade: 1, preco: 12.0 },
    ],
    tipoEntrega: 'entrega',
    endereco: {
      clienteNome: 'Ana Beatriz Souza',
      cep: '01310-100',
      texto: 'Av. Paulista, 1578 — Apto 92, Bela Vista',
    },
    status: 'em preparo',
    formaPagamento: 'pix',
    observacao: 'Sem cebola, por favor.',
    valorTotal: 57.9,
    entregador: 'Marcos Vinícius',
    criadoEm: '2026-08-06T19:12:00',
  },
  {
    id: 'ped-1041',
    numero: 1041,
    clienteNome: 'Carlos Eduardo Lima',
    itens: [
      { produtoId: 'p2', nome: 'Pizza Calabresa', quantidade: 2, preco: 48.5 },
      { produtoId: 'p8', nome: 'Borda Recheada', quantidade: 2, preco: 8.0 },
    ],
    tipoEntrega: 'entrega',
    endereco: {
      clienteNome: 'Carlos Eduardo Lima',
      cep: '04538-133',
      texto: 'Rua Funchal, 203 — Vila Olímpia',
    },
    status: 'em rota',
    formaPagamento: 'cartão',
    observacao: 'Entregar na portaria.',
    valorTotal: 113.0,
    entregador: 'Juliana Alves',
    criadoEm: '2026-08-06T18:47:00',
  },
  {
    id: 'ped-1040',
    numero: 1040,
    clienteNome: 'Fernanda Ribeiro',
    itens: [{ produtoId: 'p3', nome: 'Pizza Quatro Queijos', quantidade: 1, preco: 52.0 }],
    tipoEntrega: 'retirada',
    endereco: null,
    status: 'entregue',
    formaPagamento: 'dinheiro',
    observacao: 'Retira às 20h.',
    valorTotal: 52.0,
    entregador: null,
    criadoEm: '2026-08-06T17:30:00',
  },
  {
    id: 'ped-1039',
    numero: 1039,
    clienteNome: 'João Pedro Martins',
    itens: [
      { produtoId: 'p5', nome: 'Pizza Frango com Catupiry', quantidade: 1, preco: 51.5 },
      { produtoId: 'p6', nome: 'Pizza Pepperoni', quantidade: 1, preco: 54.9 },
      { produtoId: 'p7', nome: 'Refrigerante 2L', quantidade: 2, preco: 12.0 },
    ],
    tipoEntrega: 'entrega',
    endereco: {
      clienteNome: 'João Pedro Martins',
      cep: '05407-002',
      texto: 'Rua Cardeal Arcoverde, 1840 — Pinheiros',
    },
    status: 'recebido',
    formaPagamento: 'pix',
    observacao: 'Troco para R$ 200.',
    valorTotal: 130.4,
    entregador: 'Pedro Henrique',
    criadoEm: '2026-08-06T20:05:00',
  },
  {
    id: 'ped-1038',
    numero: 1038,
    clienteNome: 'Mariana Costa',
    itens: [{ produtoId: 'p4', nome: 'Pizza Portuguesa', quantidade: 1, preco: 50.0 }],
    tipoEntrega: 'retirada',
    endereco: null,
    status: 'entregue',
    formaPagamento: 'cartão',
    observacao: 'Cliente fidelidade.',
    valorTotal: 50.0,
    entregador: null,
    criadoEm: '2026-08-05T21:15:00',
  },
]
