import { posisInterface, memoryProcess } from "./common"

interface IInitMemory {
  posisTestId?: PosisPID,
  sleepTestId?: PosisPID,
  msg?: string,
  services: { [id: string]: ServiceDefinition }
}

export interface ServiceDefinition {
  restart: boolean
  name: string
  context: any
  status: 'started' | 'stopped'
  pid?: PosisPID
}

class Init implements IPosisProcess {
  constructor(private context: IPosisProcessContext){
    this.addService("sleeperTest","ags131/SleeperTest",{},true)
    this.addService("baseTest","POSISTest/PosisBaseTestProcess",{ maxRunTime: 5 })
  }
  get id(){
    return this.context.id
  }
  get log(){
    return this.context.log
  }
  get memory(): IInitMemory {
    return this.context.memory
  }
  get services(): { [id: string]: ServiceDefinition } {
    this.memory.services = this.memory.services || {}
    return this.memory.services
  }

  @posisInterface("baseKernel")
  private kernel: IPosisKernel

  run() {
    this.log.info(`TICK! ${Game.time}`)
    this.manageServices()
  }

  addService(id: string, name:string, context?:any, restart: boolean=false){
    if(this.services[id]) return
    this.log.warn(`Adding service ${id}`)
    this.services[id] = {
      name, context, restart,
      status: 'started'
    }
  }

  manageServices(){
    let ids = Object.keys(this.services)
    ids.forEach(id=>{
      let service = this.services[id]
      let proc: IPosisProcess
      if(service.pid) proc = this.kernel.getProcessById(service.pid)
      switch(service.status){
        case "started":
          if(!proc){
            if(service.restart || !service.pid){
              let { pid, process } = this.kernel.startProcess(service.name,Object.assign({},service.context))
              service.pid = pid
            }else{
              service.status = 'stopped'
            }
          }
          break
        case "stopped":
          if(proc && service && service.pid){
            this.log.info(`Killing stopped process ${service.name} ${service.pid}`)
            this.kernel.killProcess(service.pid)
          }
          break
      }
    })
  }
}

export const bundle: IPosisBundle<{}> = {
  install(registry: IPosisProcessRegistry) {
    registry.register("init", Init)
  }
}
