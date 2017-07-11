import { posisInterface, memoryProcess } from "./common"
import { each } from "lodash-es"

class SpawnTest implements IPosisProcess {
  constructor(private context: IPosisProcessContext) {}
  
  @posisInterface("spawn")
  private spawner: IPosisSpawnExtension
  
  @posisInterface("baseKernel")
  private kernel: IPosisKernel

  get creeps(): string[] {
    this.context.memory.creeps = this.context.memory.creeps || []
    return this.context.memory.creeps
  }
  get children(): { [id: string]: PosisPID } {
    this.context.memory.children = this.context.memory.children || {}
    return this.context.memory.children
  }


  run(){
    this.context.log.info(`Last ran ${Game.time - this.context.memory.lastRun} ticks ago`)
    this.context.log.info(`Sleeping for 5 ticks (${Game.time})`)
    let sleeper = this.context.queryPosisInterface("sleep")
    sleeper.sleep(5)
    if(!this.spawner) return;
    this.context.memory.lastRun = Game.time
    if(this.creeps.length < 5){
      let id = this.spawner.spawnCreep({ rooms: ["sim"], body: [[MOVE as string]] })
      this.creeps.push(id)
    }
    let rem: number[] = []
    each(this.creeps,(id: string,ind: number)=>{
      let s = this.spawner.getStatus(id)
      if(s.status == EPosisSpawnStatus.SPAWNED){
        let c = this.spawner.getCreep(id)
        if(!c) return rem.push(ind)

        if(c && !this.children[id]){
          let { pid, process } = this.kernel.startProcess('ags131/SpawnTestCreep',{ id })
          process.run()
          this.children[id] = pid
        }
      }
    })
    while(rem.length){
      let ind: number = rem.pop()
      this.creeps.splice(ind,1)
    }
  }
}

class SpawnTestCreep implements IPosisProcess {
  constructor(private context: IPosisProcessContext) {}
  
  @posisInterface("baseKernel")
  private kernel: IPosisKernel
  
  @posisInterface("spawn")
  private spawner: IPosisSpawnExtension

  run(){
    let creep = this.spawner.getCreep(this.context.memory.id)
    if(!creep){
      this.kernel.killProcess(this.context.id)
      return
    }
    creep.move(Math.round(Math.random()*8)+1)
    creep.say(this.context.memory.id)
  }
}


export const bundle: IPosisBundle<{}> = {
  install(registry: IPosisProcessRegistry) {
    registry.register("ags131/SpawnTest", SpawnTest);
    registry.register("ags131/SpawnTestCreep", SpawnTestCreep);
  }
}
