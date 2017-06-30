interface PosisInterfaces {
  agsExtensionRegistry: IPosisExtension
}

interface SpawnQueueStatusValue {
  status: EPosisSpawnStatus,
  message?: string,
  creepID?: string
}

interface SpawnQueueStatus {
  [id: string]: SpawnQueueStatusValue
}

interface SpawnQueueItem {
  statusId: string,
  priority: number,
  rooms: string[],
  body: string[][]
}
