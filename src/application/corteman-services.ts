import { ServicoService } from './servico-service'
import { SqliteServicoRepository } from '../infrastructure/repositories/sqlite-servico-repository'

export const servicoService = new ServicoService(new SqliteServicoRepository())
