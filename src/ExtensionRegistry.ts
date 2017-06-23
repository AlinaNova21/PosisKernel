import { Logger } from "Logger";

let logger = new Logger("[ExtensionRegistry]");
logger.level = LogLevel.DEBUG;

let registry: { [interfaceId: string]: IPosisExtension } = {};
export class ExtensionRegistry {
  static register(interfaceId: string, extension: IPosisExtension): boolean {
    if (registry[interfaceId]){
      logger.error(`Interface Id already registered: ${interfaceId}`);
      return false;
    }
    logger.debug(`Registered ${interfaceId}`);
    registry[interfaceId] = extension;
    return true;
  }
  static getExtension(interfaceId: string): IPosisExtension | undefined {
    if (!registry[interfaceId]) return;
    return registry[interfaceId];
  }
}

declare var global: Global
global.queryPosisInterface = ExtensionRegistry.getExtension;
