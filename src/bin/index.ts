import { bundle as InitBundle} from "./Init";
import { bundle as PosisTestBundle} from "./PosisTest";

export const bundle: IPosisBundle<{}> = {
  install(registry: IPosisProcessRegistry) {
    InitBundle.install(registry)
    PosisTestBundle.install(registry)
  }
}