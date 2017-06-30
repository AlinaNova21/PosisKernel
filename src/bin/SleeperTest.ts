class SleeperTest implements IPosisProcess {
  constructor(private context: IPosisProcessContext) {}
  run(){
    this.context.log.info(`Last ran ${Game.time - this.context.memory.lastRun} ticks ago`)
    this.context.log.info(`Sleeping for 5 ticks (${Game.time})`)
    let sleeper = this.context.queryPosisInterface("sleep")
    sleeper.sleep(5)
    this.context.memory.lastRun = Game.time
  }

}

export const bundle: IPosisBundle<{}> = {
  install(registry: IPosisProcessRegistry) {
    registry.register("ags131/SleeperTest", SleeperTest);
  }
}
