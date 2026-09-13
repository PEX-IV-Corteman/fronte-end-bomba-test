import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite'
import { defineCustomElements } from 'jeep-sqlite/loader'

const DATABASE_NAME = 'corteman'
const DATABASE_VERSION = 1

const migrationV1 = `
  CREATE TABLE IF NOT EXISTS servicos (
    servico_id TEXT PRIMARY KEY NOT NULL,
    nome_servico TEXT NOT NULL COLLATE NOCASE UNIQUE,
    valor_servico_centavos INTEGER NOT NULL CHECK (valor_servico_centavos > 0)
  );
  PRAGMA user_version = 1;
`

class SqliteDatabase {
  private sqlite = new SQLiteConnection(CapacitorSQLite)
  private connection: SQLiteDBConnection | null = null
  private initialization: Promise<void> | null = null

  async initialize() {
    if (!this.initialization) this.initialization = this.openAndMigrate()
    return this.initialization
  }

  async query<T>(statement: string, values: unknown[] = []): Promise<T[]> {
    await this.initialize()
    const result = await this.requireConnection().query(statement, values)
    return (result.values ?? []) as T[]
  }

  async run(statement: string, values: unknown[] = []) {
    await this.initialize()
    const result = await this.requireConnection().run(statement, values)
    if (Capacitor.getPlatform() === 'web') await this.sqlite.saveToStore(DATABASE_NAME)
    return result
  }

  private async openAndMigrate() {
    if (Capacitor.getPlatform() === 'web') await this.initializeWebStore()

    const consistency = await this.sqlite.checkConnectionsConsistency()
    const existingConnection = await this.sqlite.isConnection(DATABASE_NAME, false)
    this.connection = consistency.result && existingConnection.result
      ? await this.sqlite.retrieveConnection(DATABASE_NAME, false)
      : await this.sqlite.createConnection(DATABASE_NAME, false, 'no-encryption', DATABASE_VERSION, false)

    await this.connection.open()
    await this.connection.execute(migrationV1)
    if (Capacitor.getPlatform() === 'web') await this.sqlite.saveToStore(DATABASE_NAME)
  }

  private async initializeWebStore() {
    defineCustomElements(window)

    if (!document.querySelector('jeep-sqlite')) {
      document.body.appendChild(document.createElement('jeep-sqlite'))
    }

    await customElements.whenDefined('jeep-sqlite')
    await this.sqlite.initWebStore()
  }

  private requireConnection() {
    if (!this.connection) throw new Error('A conexão SQLite não foi inicializada.')
    return this.connection
  }
}

export const sqliteDatabase = new SqliteDatabase()
