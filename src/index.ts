import { BaseKernel } from "BaseKernel";
import { ProcessRegistry } from "ProcessRegistry";
import { ExtensionRegistry } from "ExtensionRegistry";

import * as InitBundle from "Init";
import * as PosisTestBundle from "PosisTest";


let extensionRegistry = new ExtensionRegistry();
let processRegistry = new ProcessRegistry();

let pkernel = new BaseKernel(processRegistry);

extensionRegistry.register("baseKernel", pkernel);

processRegistry.install(InitBundle.bundle);
processRegistry.install(PosisTestBundle.bundle);

export function loop() {
  pkernel.loop();
}