import { ExtensionRegistry } from "../../lib/ExtensionRegistry"
import { SpawnExtension } from "./SpawnExtension"
import { posisInterface } from "../common"

interface SpawnManagerMemory {
  queue: SpawnQueueItem[][],
  status: SpawnQueueStatus
}

export class SpawnManager implements IPosisProcess {
  constructor(private context: IPosisProcessContext) {
    let reg = context.queryPosisInterface("agsExtensionRegistry") as ExtensionRegistry;
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
    if(this.memory.queue.length != 10){
      this.memory.queue = []
      for(let i=0;i<10;i++) 
        this.memory.queue.push([])      
    }
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
  }

}
