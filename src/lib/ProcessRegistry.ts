import { Logger } from "../lib/Logger";

let logger = new Logger("[ProcessRegistry]");
logger.level = LogLevel.DEBUG;

export class ProcessRegistry implements IPosisProcessRegistry {
  private registry: { [name: string]: PosisProcessConstructor } = {};
  constructor () {
  }
  register(name: string, constructor: PosisProcessConstructor): boolean {
    if (this.registry[name]){
      logger.error(`Name already registered: ${name}`);
      return false;
    }
    logger.debug(`Registered ${name}`);
    this.registry[name] = constructor;
    return true;
  }
  install(bundle: IPosisBundle<any>){
    bundle.install(this)
  }
  getNewProcess(name: string, context: IPosisProcessContext): IPosisProcess | undefined {
    if (!this.registry[name]) return;
    logger.debug(`Created ${name}`);
    return new this.registry[name](context);
  }
}
