import { Logger } from "../lib/Logger";

let logger = new Logger("[ExtensionRegistry]");
logger.level = LogLevel.DEBUG;

export class ExtensionRegistry {
  private registry: { [interfaceId: string]: IPosisExtension } = {};
  constructor() {
  }
  register(interfaceId: string, extension: IPosisExtension): boolean {
    if (this.registry[interfaceId]) {
      logger.error(`Interface Id already registered: ${interfaceId}`);
      return false;
    }
    logger.debug(`Registered ${interfaceId}`);
    this.registry[interfaceId] = extension;
    return true;
  }
  getExtension(interfaceId: string): IPosisExtension | undefined {
    if (!this.registry[interfaceId]) return;
    return this.registry[interfaceId];
  }
}

