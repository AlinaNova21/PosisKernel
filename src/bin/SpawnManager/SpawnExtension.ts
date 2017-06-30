export class SpawnExtension implements IPosisSpawnExtension {
  constructor(private context: { queue: SpawnQueueItem[][], status: SpawnQueueStatus }){}
  private get queue(): SpawnQueueItem[][] {
    return this.context.queue;
  }  
  private get status(): SpawnQueueStatus {
    return this.context.status;
  } 
  private UID(): string {
    return "S" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3);
  }
  // Queues/Spawns the creep and returns an ID
  spawnCreep(opts: { rooms: string[], body: string[][], priority?: number, pid?: PosisPID }): string {
    let { rooms, body } = opts
    let priority = Math.min(Math.max(opts.priority || 0,0),10)
    let uid = this.UID();
    let item: SpawnQueueItem = {
      statusId: uid,
      rooms,
      body,
      priority,
    }
    this.queue[priority].push(item)
    this.status[uid] = {
      status: EPosisSpawnStatus.QUEUED
    }
    return uid;
  }
  // Used to see if its been dropped from queue
  getStatus(id: string): { status: EPosisSpawnStatus, message?: string } {
    return this.status[id] || { status: EPosisSpawnStatus.ERROR, message: "ID Doesn't Exist" }
  }
  getCreep(id: string): Creep | undefined {
    let stat = this.getStatus(id) as SpawnQueueStatusValue;
    if(stat.status == EPosisSpawnStatus.SPAWNED)
      return Game.getObjectById<Creep>(stat.creepID);
    else
      return;
  }
}