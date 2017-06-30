import { SpawnManager } from "./SpawnManager"

export const bundle: IPosisBundle<{}> = {
  install(registry: IPosisProcessRegistry) {
    registry.register("ags131/SpawnManager", SpawnManager);
  }
}

