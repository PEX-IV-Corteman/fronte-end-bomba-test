export type Servico = {
  servico_id: string
  nome_servico: string
  valor_servico: number | string
}

export type NovoServico = Pick<Servico, 'nome_servico'> & {
  valor_servico: number | string
}

export class ServicoValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServicoValidationError'
  }
}

export class ServicoDuplicadoError extends Error {
  constructor() {
    super('Já existe um serviço com este nome.')
    this.name = 'ServicoDuplicadoError'
  }
}
