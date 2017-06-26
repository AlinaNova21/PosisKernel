class Init implements IPosisProcess {
  constructor(private context: IPosisProcessContext){

  }
  get id(){
    return this.context.id
  }
  get log(){
    return this.context.log
  }
  get memory(){
    return this.context.memory
  }
  get posisTest(): IPosisProcess | undefined {
    let kernel: IPosisKernel = this.context.queryPosisInterface("baseKernel") as IPosisKernel;
    if (!this.memory.posisTestId) return;
    return kernel.getProcessById(this.memory.posisTestId);
  }
  set posisTest(value: IPosisProcess) {
    this.memory.posisTestId = value.id;
  }
  run() {
    let kernel: IPosisKernel = this.context.queryPosisInterface("baseKernel");
    this.log.info(`TICK! ${Game.time} ${this.memory.msg || "init"}`);
    if (!this.posisTest) {
      let child = kernel.startProcess("POSISTest/PosisBaseTestProcess", {
        maxRunTime: 5
      });
      this.posisTest = child;
    }
  }
}

export const bundle: IPosisBundle = {
  install(registry: IPosisProcessRegistry) {
    registry.register("init", Init);
  }
}

