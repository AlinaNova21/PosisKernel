// From unfleshedone
// Root process expects to be started with 'startContext = { maxRunTime: N }'

interface POSISTest_BaseProcessMemory
{
  started?: number;
  lastTick?: number;
  supposedToBeDead?: boolean;

  // set by start context
  maxRunTime?: number;
}

class POSISTest_BaseProcess implements IPosisProcess
{
  public testName = "POSIS base:";
  public static ImageName = "POSISTest/PosisBaseTestProcess";

  constructor(private context: IPosisProcessContext){

  }

  public get tmemory(): POSISTest_BaseProcessMemory
  {
    return this.memory as POSISTest_BaseProcessMemory;
  }

  public run(): void
  {
    let kernel: IPosisKernel = this.context.queryPosisInterface("baseKernel") as IPosisKernel;
    let fatal = false;

    if (this.log === undefined)
      throw Error(`${this.testName}: 'log' is not set`);

    if (this.memory === undefined)
    {
      this.log.error(`${this.testName}: 'memory' not set`);
      fatal = true;
    }

    this.log.error(`${this.testName}: starting basic diagnostics`);

    this.log.debug(`${this.testName}: debug message`);
    this.log.debug(() => `${this.testName}: deferred debug message`);
    this.log.info(`${this.testName}: info message`);
    this.log.info(() => `${this.testName}: deferred info message`);
    this.log.warn(`${this.testName}: warn message`);
    this.log.warn(() => `${this.testName}: deferred warn message`);
    this.log.error(`${this.testName}: error message`);
    this.log.error(() => `${this.testName}: deferred error message`);

    if (this.imageName === undefined)
      this.log.error(`${this.testName}: 'imageName' not set`);

    if (this.imageName !== POSISTest_BaseProcess.ImageName)
      this.log.error(`${this.testName}: 'imageName' not matching, expected: '${POSISTest_BaseProcess.ImageName}', actual '${this.imageName}'`);

    if (this.id === undefined)
      this.log.error(`${this.testName}: 'id' not set`);

    if (this.parentId === undefined)
      this.log.error(`${this.testName}: 'parentId' not set`);

    this.log.error(`${this.testName}: basic diagnostics completed`);

    if (fatal)
    {
      this.log.error(`${this.testName}: fatal errors, trying to exit`);
      kernel.killProcess(this.id);
      return;
    }

    if (this.tmemory.started === undefined)
    {
      this.tmemory.started = Game.time;
      this.tmemory.lastTick = Game.time;
    }

    if (this.tmemory.supposedToBeDead)
      this.log.error(`${this.testName}: can't exit`);

    this.log.info(`${this.testName}: started on ${this.tmemory.started}, running for ${Game.time - this.tmemory.started!}`);

    if (this.tmemory.maxRunTime === undefined)
    {
      this.log.error(`${this.testName}: 'maxRunTime' is not set, arguments are not passed, or broken`);
      return;
    }

    if (Game.time - this.tmemory.started! >= this.tmemory.maxRunTime!)
    {
      this.tmemory.supposedToBeDead = true;
      kernel.killProcess(this.id);
    }

    this.tmemory.lastTick = Game.time;
  }

  // ==================================
  // Host OS is providing everything below
  get memory(): any { // private memory
    return this.context.memory;
  }
  get imageName(): string { // image name (maps to constructor)
    return this.context.imageName;
  }
  get id(): PosisPID { // ID
    return this.context.id;
  }
  get parentId(): PosisPID { // Parent ID
    return this.context.parentId;
  }
  get log(): IPosisLogger { // Logger
    return this.context.log;
  }
}

interface IPosisBundleDefinition
{
  rootImageName: string;
  defaultStartContext: any;
}

// tslint:disable-next-line:max-classes-per-file
export const bundle: IPosisBundle = {
  install(registry: IPosisProcessRegistry) {
    registry.register(POSISTest_BaseProcess.ImageName, POSISTest_BaseProcess);
  }
}