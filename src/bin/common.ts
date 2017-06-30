export function memoryProcess(): (target: any, propertyKey: string)=>any {
  return function(target: any, propertyKey: string): any {
    let key = `__mp_${propertyKey}`;
    return {
      get(): { pid: PosisPID, process: IPosisProcess } {
        let kernel: IPosisKernel = this.context.queryPosisInterface("baseKernel") as IPosisKernel
        if (!this.context.memory[key]) return
        let pid = this.context.memory[key]
        let process = kernel.getProcessById(pid)
        return { pid, process }
      },
      set(value: { pid: PosisPID, process: IPosisProcess }) {
        this.context.memory[key] = value.pid;
      }
    }
  }
}

export function posisInterface(interfaceId: string): (target: any, propertyKey: string)=>any {
  return function(target: any, propertyKey: string): any {
    let value: IPosisExtension
    return {
      get(){
        if(!value){
          value = this.context.queryPosisInterface(interfaceId);
        }
        return value
      }
    }
  }
}