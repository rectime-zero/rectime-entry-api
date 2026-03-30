export type D1PreparedStatementLike = {
  bind(...values: unknown[]): D1PreparedStatementLike
  first<T>(): Promise<T | null>
  all<T>(): Promise<{ results: T[] }>
  run(): Promise<unknown>
}

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatementLike
}

export type Env = {
  DB: D1DatabaseLike
  FIREBASE_PROJECT_ID: string
  FIREBASE_CLIENT_EMAIL?: string
  FIREBASE_PRIVATE_KEY?: string
  ENTRY_TOKEN_SECRET: string
}

export type AppBindings = {
  Bindings: Env
  Variables: {
    requestId: string
  }
}
