import { bundle as InitBundle} from "./Init";
import { bundle as PosisTestBundle} from "./PosisTest";
import { bundle as SpawnManagerBundle} from "./SpawnManager";
import { bundle as SleeperTestBundle} from "./SleeperTest";
import { bundle as SpawnTestBundle} from "./SpawnTest";

export const bundle: IPosisBundle<{}> = {
  install(registry: IPosisProcessRegistry) {
    InitBundle.install(registry)
    PosisTestBundle.install(registry)
    SpawnManagerBundle.install(registry)
    SleeperTestBundle.install(registry)
    SpawnTestBundle.install(registry)
  }
}