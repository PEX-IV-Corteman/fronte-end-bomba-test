import { ServicoDuplicadoError, type Servico } from '../../domain/servico'
import { sqliteDatabase } from '../database/sqlite-database'

type ServicoRow = {
  servico_id: string
  nome_servico: string
  valor_servico_centavos: number
}

export class SqliteServicoRepository {
  async list(): Promise<Servico[]> {
    const rows = await sqliteDatabase.query<ServicoRow>(`
      SELECT servico_id, nome_servico, valor_servico_centavos
      FROM servicos
      ORDER BY nome_servico COLLATE NOCASE
    `)
    return rows.map(toServico)
  }

  async create(servico: Servico, valorCentavos: number): Promise<Servico> {
    try {
      await sqliteDatabase.run(
        'INSERT INTO servicos (servico_id, nome_servico, valor_servico_centavos) VALUES (?, ?, ?)',
        [servico.servico_id, servico.nome_servico, valorCentavos],
      )
    } catch (error) {
      if (String(error).toLowerCase().includes('unique')) throw new ServicoDuplicadoError()
      throw error
    }
    return servico
  }
}

function toServico(row: ServicoRow): Servico {
  return {
    servico_id: row.servico_id,
    nome_servico: row.nome_servico,
    valor_servico: (row.valor_servico_centavos / 100).toFixed(2),
  }
}
