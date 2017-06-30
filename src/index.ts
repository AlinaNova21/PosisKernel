import { BaseKernel } from "./lib/BaseKernel";
import { ProcessRegistry } from "./lib/ProcessRegistry";
import { ExtensionRegistry } from "./lib/ExtensionRegistry";

import { bundle as bin } from "./bin/index";

export let extensionRegistry = new ExtensionRegistry();
export let processRegistry = new ProcessRegistry();

let pkernel = new BaseKernel(processRegistry, extensionRegistry);

extensionRegistry.register("baseKernel", pkernel);
extensionRegistry.register("sleep", pkernel);

processRegistry.install(bin);

export function loop() {
  pkernel.loop();
}