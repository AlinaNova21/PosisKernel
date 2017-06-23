import { Logger } from "Logger";
import { BaseKernel } from "BaseKernel";
import { ProcessRegistry } from "ProcessRegistry";
import { ExtensionRegistry } from "ExtensionRegistry";

let pkernel = new BaseKernel();

ExtensionRegistry.register("baseKernel", pkernel);

export function loop() {
  pkernel.loop();
}