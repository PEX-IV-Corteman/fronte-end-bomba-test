import { ServicoValidationError, type NovoServico, type Servico } from '../domain/servico'
import { SqliteServicoRepository } from '../infrastructure/repositories/sqlite-servico-repository'

export class ServicoService {
  constructor(private readonly repository: SqliteServicoRepository) {}

  list() {
    return this.repository.list()
  }

  async create(input: NovoServico): Promise<Servico> {
    const nome_servico = input.nome_servico.trim()
    const valorCentavos = toCentavos(input.valor_servico)

    if (nome_servico.length < 1 || nome_servico.length > 80) {
      throw new ServicoValidationError('O nome do serviço deve ter entre 1 e 80 caracteres.')
    }

    const servico: Servico = {
      servico_id: crypto.randomUUID(),
      nome_servico,
      valor_servico: (valorCentavos / 100).toFixed(2),
    }
    return this.repository.create(servico, valorCentavos)
  }
}

function toCentavos(value: number | string) {
  const numericValue = Number(value)
  const centavos = Math.round(numericValue * 100)

  if (!Number.isFinite(numericValue) || numericValue <= 0 || Math.abs(numericValue * 100 - centavos) > Number.EPSILON || centavos > 9_999_999_999) {
    throw new ServicoValidationError('O valor do serviço deve ser positivo, ter até duas casas decimais e respeitar o limite permitido.')
  }
  return centavos
}
