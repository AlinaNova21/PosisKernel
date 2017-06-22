import { Logger } from "Logger";
import { BaseKernel } from "BaseKernel";
import { ProcessRegistry } from "ProcessRegistry";

let processRegistry = new ProcessRegistry();
let pkernel = new BaseKernel();

declare var global: Global;

global.queryPosisInterface = function(interfaceId: string): IPosisExtension | undefined {
  if (interfaceId === "baseKernel") return pkernel;
    // if (interfaceId === "spawn-v1") return spawnExtension;
  return;
};

export function loop() {
  pkernel.loop();
}