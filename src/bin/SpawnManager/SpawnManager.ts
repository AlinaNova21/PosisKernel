import { ExtensionRegistry } from "../../lib/ExtensionRegistry"
// import { SpawnExtension } from "./SpawnExtension"
import { posisInterface } from "../common"
import { filter, each, map, maxBy, sortBy, reduce } from "lodash-es"

interface SpawnManagerMemory {
  queue: SpawnQueueItem[][],
  status: SpawnQueueStatus
}

export class SpawnManager implements IPosisProcess {
  constructor(private context: IPosisProcessContext) {
    let reg = context.queryPosisInterface("agsExtensionRegistry") as ExtensionRegistry;
    if(!context.memory.queue){
      context.memory.queue = []
      for(let i=0;i<10;i++) 
        context.memory.queue.push([])      
    }
    if(!context.memory.status){
      context.memory.status = {}
    }
    let registered = reg.register('spawn',new SpawnExtension({ 
      get queue(){ return context.memory.queue },
      get status(){ return context.memory.status }
    }))
    if(!registered) throw new Error("Could not register SpawnExtension")
  }
  get id(){ return this.context.id }
  private get memory(){
    return this.context.memory
  }
  private get queue(): SpawnQueueItem[][] {
    return this.memory.queue;
  }  
  private get status(): SpawnQueueStatus {
    return this.memory.status;
  }

  @posisInterface("sleep")
  private sleeper: IPosisSleepExtension

  sleep(ticks: number){
    let sleeper = this.context.queryPosisInterface("sleep")
  }
  run(){
    this.context.log.info(`Sleeping for 5 ticks (${Game.time})`)
    this.sleeper.sleep(5)
    if(this.queue.length){
      let spawns = filter(Game.spawns,(spawn:Spawn)=>!spawn.spawning)
      if(spawns.length){
        for(let qi = 0;qi<this.queue.length;qi++){
          let queue = this.queue[qi]
          let drop = []
          for(let i=0;i<queue.length;i++){
            let item: SpawnQueueItem = queue[i]
            let cspawns = map(spawns,(spawn: Spawn,index: number)=>{
              let dist = Game.map.getRoomLinearDistance(spawn.room.name,item.rooms[0])
              let energy = spawn.room.energyAvailable
              let rank = energy - (dist * 50)
              return { index, dist, energy, rank, spawn }
            })
            cspawns = sortBy(cspawns,(s:any)=>s.rank)
            let bodies = map(item.body,(body: string[])=>{
              let cost = reduce(body,(l:any,v:any)=>l+BODYPART_COST[v],0)
              return { cost, body }
            })
            let { index, energy, spawn } = cspawns.pop()
            let { body } = maxBy(filter(bodies,(b: any)=>b.cost <= energy),'cost') || { body: false }
            if(!body) continue
            spawns.splice(index,1)
            let status = this.status[item.statusId]
            let ret = spawn.createCreep(body,item.statusId)
            this.context.log.info(`Spawning ${item.statusId}`)
            if(typeof ret == 'string'){
              status.status = EPosisSpawnStatus.SPAWNING
            }else{
              status.status = EPosisSpawnStatus.ERROR
              status.message = this.spawnErrMsg(ret as ResponseCode)
            }
            drop.push(i)
          }
          while(drop.length)
            queue.splice(drop.pop(),1)
        }
      }
    }
  }
  spawnErrMsg(err: ResponseCode): string{
    let errors = {
      [ERR_NOT_OWNER as number]:  "You are not the owner of this spawn.",
      [ERR_NAME_EXISTS as number]:  "There is a creep with the same name already.",
      [ERR_BUSY as number]:  "The spawn is already in process of spawning another creep.",
      [ERR_NOT_ENOUGH_ENERGY as number]:  "The spawn and its extensions contain not enough energy to create a creep with the given body.",
      [ERR_INVALID_ARGS as number]:  "Body is not properly described.",
      [ERR_RCL_NOT_ENOUGH as number]:  "Your Room Controller level is insufficient to use this spawn.",
    }
    return errors[err as number]
  }

}

export class SpawnExtension implements IPosisSpawnExtension {
  constructor(private context: { queue: SpawnQueueItem[][], status: SpawnQueueStatus }){
    console.log(JSON.stringify(this.context),JSON.stringify(context))
  }
  private get queue(): SpawnQueueItem[][] {
    return this.context.queue;
  }  
  private get status(): SpawnQueueStatus {
    return this.context.status;
  } 
  private UID(): string {
    return ("C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3)).toUpperCase();
  }
  // Queues/Spawns the creep and returns an ID
  spawnCreep(opts: { rooms: string[], body: string[][], priority?: number, pid?: PosisPID }): string {
    console.log(JSON.stringify(this.context))
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
    let stat = this.status[id] || { status: EPosisSpawnStatus.ERROR, message: "ID Doesn't Exist" }
    if(stat.status == EPosisSpawnStatus.SPAWNING && Game.creeps[id] && !Game.creeps[id].spawning)
      stat.status = EPosisSpawnStatus.SPAWNED
    return stat
  }
  getCreep(id: string): Creep | undefined {
    let stat = this.getStatus(id) as SpawnQueueStatusValue;
    if(stat.status == EPosisSpawnStatus.SPAWNED)
      return Game.creeps[id];
    else
      return;
  }
}