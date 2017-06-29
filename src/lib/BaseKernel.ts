import { ProcessRegistry } from "../lib/ProcessRegistry";
import { Logger } from "../lib/Logger";

export interface ProcessInfo {
  id: PosisPID;
  pid: PosisPID;
  name: string;
  ns: string;
  status: string;
  started: number;
  ended?: number;
  process?: IPosisProcess;
  error?: string;
}

export interface ProcessTable {
  [id: string]: ProcessInfo;
}

export interface ProcessMemoryTable {
  [id: string]: {};
}

export interface KernelMemory {
  processTable: ProcessTable;
  processMemory: ProcessMemoryTable;
}

declare global {
  interface Memory {
    kernel: KernelMemory;
  }
}

export class BaseKernel implements IPosisKernel {
  private processInstanceCache: { 
    [id: string]: {
      context: IPosisProcessContext,
      process: IPosisProcess
    }
  } = {};
  private currentId: string = "";
  private log: Logger = new Logger("[Kernel]");

  get memory(): KernelMemory {
    Memory.kernel = Memory.kernel || { processTable: {}, processMemory: {} };
    return Memory.kernel;
  }
  get processTable(): ProcessTable {
    this.memory.processTable = this.memory.processTable || {};
    return this.memory.processTable;
  }
  get processMemory(): ProcessMemoryTable {
    this.memory.processMemory = this.memory.processMemory || {};
    return this.memory.processMemory;
  }

  constructor(private processRegistry: ProcessRegistry) {

  }

  UID(): string {
    return "P" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3);
  }

  startProcess(imageName: string, startContext: any): { pid: PosisPID; process: IPosisProcess; } | undefined {
    let id = this.UID() as PosisPID;

    let pinfo: ProcessInfo = {
      id: id,
      pid: this.currentId,
      name: imageName,
      ns: `ns_${id}`,
      status: "running",
      started: Game.time
    };
    this.processTable[id] = pinfo;
    this.processMemory[pinfo.ns] = startContext || {};
    let process = this.createProcess(id);
    this.log.debug(() => `startProcess ${imageName}`);
    return { pid: id,  process };
  }

  createProcess(id: PosisPID): IPosisProcess {
    this.log.debug(() => `createProcess ${id}`);
    let pinfo = this.processTable[id];
    if (!pinfo || pinfo.status !== "running") throw new Error(`Process ${pinfo.id} ${pinfo.name} not running`);
    let self = this;
    let context: IPosisProcessContext = {
      id: pinfo.id,
      get parentId(){
        return self.processTable[id] && self.processTable[id].pid || "";
      },
      imageName: pinfo.name,
      log: new Logger(`[${pinfo.id}) ${pinfo.name}]`),
      get memory() {
        self.processMemory[pinfo.ns] = self.processMemory[pinfo.ns] || {};
        return self.processMemory[pinfo.ns];
      },
      queryPosisInterface(interfaceId: string): IPosisExtension | undefined {
        // Stub for now until I figure out howto make this work without kernel having to import
        if(interfaceId == 'baseKernel') return self;
        return;
      }
    };
    Object.freeze(context);
    let process = this.processRegistry.getNewProcess(pinfo.name, context);
    if (!process) throw new Error(`Could not create process ${pinfo.id} ${pinfo.name}`);
    this.processInstanceCache[id] = { context, process };
    return process;
  }
  // killProcess also kills all children of this process
  // note to the wise: probably absorb any calls to this that would wipe out your entire process tree.
  killProcess(id: PosisPID): void {
    let pinfo = this.processTable[id];
    if (!pinfo) return;
    this.log.warn(() => `killed ${id}`);
    pinfo.status = "killed";
    let ids = Object.keys(this.processTable);
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      let pi = this.processTable[id]
      if (pi.pid === pinfo.id) {
        this.killProcess(pi.pid);
      }
    }
  }

  getProcessById(id: PosisPID): IPosisProcess | undefined {
    return this.processTable[id] && this.processTable[id].status === "running" && (this.processInstanceCache[id] && this.processInstanceCache[id].process || this.createProcess(id));
  }

  // passing undefined as parentId means "make me a root process"
  // i.e. one that will not be killed if another process is killed
  setParent(id: PosisPID, parentId?: PosisPID): boolean {
    if (!this.processTable[id]) return false;
    this.processTable[id].pid = parentId;
    return true;
  }

  loop() {
    let ids = Object.keys(this.processTable);
    if (ids.length === 0) {
      let proc = this.startProcess("init", {});
      // Due to breaking changes in the standard, 
      // init can no longer be ran on first tick.
      if (proc) ids.push(proc.pid.toString());
    }
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      let pinfo = this.processTable[id];
      if (pinfo.status !== "running" && pinfo.ended < Game.time - 100) {
        delete this.processTable[id];
      }
      if (pinfo.status !== "running") continue;
      try {
        let proc = this.getProcessById(id);
        if (!proc) throw new Error(`Could not get process ${id} ${pinfo.name}`);
        this.currentId = id;
        proc.run();
        this.currentId = "";
      } catch (e) {
        this.killProcess(id);
        pinfo.status = "crashed";
        pinfo.error = e.stack || e.toString();
        this.log.error(() => `[${id}] ${pinfo.name} crashed\n${e.stack}`);
      }
    }
  }
}