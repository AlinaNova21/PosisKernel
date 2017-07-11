import { Logger } from "../lib/Logger";

let logger = new Logger("[ExtensionRegistry]");
logger.level = LogLevel.DEBUG;

export class ExtensionRegistry implements IPosisExtension {
  private registry: { [interfaceId: string]: IPosisExtension } = {};
  constructor() {
    this.register('agsExtensionRegistry', this);
  }
  register(interfaceId: string, extension: IPosisExtension): boolean {
    // if (this.registry[interfaceId]) {
    //   logger.error(`Interface Id already registered: ${interfaceId}`);
    //   return false;
    // }
    logger.debug(`Registered ${interfaceId}`);
    this.registry[interfaceId] = extension;
    return true;
  }
  unregister(interfaceId: string): boolean {
   if (this.registry[interfaceId]) {
      logger.debug(`Unregistered ${interfaceId}`);
      delete this.registry[interfaceId]
      return true; 
    } else {
      logger.error(`Interface Id not registered: ${interfaceId}`);
      return false;
    }
  }
  getExtension(interfaceId: string): IPosisExtension | undefined {
    if (!this.registry[interfaceId]) return;
    return this.registry[interfaceId];
  }
}

