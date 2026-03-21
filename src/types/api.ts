export type ApiTopic = {
  id: number
  name: string
}

export type ApiSubject = {
  id: number
  name: string
  topics: ApiTopic[]
}

