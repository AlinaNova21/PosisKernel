import { Logger } from "Logger";

export type PosisProcessConstructor = new () => IPosisProcess

declare var global: Global;

let logger = new Logger("[ProcessRegistry]");
logger.level = LogLevel.DEBUG;

let registry: { [name: string]: PosisProcessConstructor } = {};
export class ProcessRegistry {
  static register(name: string, constructor: PosisProcessConstructor): boolean {
    if (registry[name]){
      logger.error(`Name already registered: ${name}`);
      return false;
    }
    logger.debug(`Registered ${name}`);
    registry[name] = constructor;
    return true;
  }
  static getNewProcess(name: string): IPosisProcess | undefined {
    if (!registry[name]) return;
    logger.debug(`Created ${name}`);
    return new registry[name]();
  }
}

global.registerPosisProcess = ProcessRegistry.register; 