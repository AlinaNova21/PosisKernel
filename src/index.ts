import { BaseKernel } from "./lib/BaseKernel";
import { ProcessRegistry } from "./lib/ProcessRegistry";
import { ExtensionRegistry } from "./lib/ExtensionRegistry";

import { bundle as bin } from "./bin/index";

let extensionRegistry = new ExtensionRegistry();
let processRegistry = new ProcessRegistry();

let pkernel = new BaseKernel(processRegistry);

extensionRegistry.register("baseKernel", pkernel);

processRegistry.install(bin);

export function loop() {
  pkernel.loop();
}