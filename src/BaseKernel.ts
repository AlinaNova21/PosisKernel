import { ProcessRegistry } from "ProcessRegistry";
import { Logger, LogLevel } from "Logger";

interface ProcessInfo {
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

interface ProcessTable {
  [id: string]: ProcessInfo;
}

export class BaseKernel implements IPosisKernel {
  private processInstanceCache: { [id: string]: IPosisProcess } = {};
  private currentId: string = "";
  private log: Logger = new Logger("[Kernel]");

  get memory(): any {
    Memory.kernel = Memory.kernel || {};
    return Memory.kernel;
  }
  get processTable(): ProcessTable {
    this.memory.processTable = this.memory.processTable || {};
    return this.memory.processTable;
  }
  get processMemory(): any {
    this.memory.processMemory = this.memory.processMemory || {};
    return this.memory.processMemory;
  }
  UID(): string {
    return "P" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3);
  }

  startProcess(imageName: string, startContext: any): IPosisProcess | undefined {
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
    return process;
  }

  createProcess(id: PosisPID): IPosisProcess {
    this.log.debug(() => `createProcess ${id}`);
    let pinfo = this.processTable[id];
    if (!pinfo || pinfo.status !== "running") throw new Error(`Process ${pinfo.id} ${pinfo.name} not running`);
    let process = ProcessRegistry.getNewProcess(pinfo.name);
    if (!process) throw new Error(`Could not create process ${pinfo.id} ${pinfo.name}`);
    let self = this;
    this.processInstanceCache[id] = process;
    Object.defineProperties(process, {
      id: {
        writable: false,
        value: pinfo.id
      },
      parentId: {
        writable: false,
        value: pinfo.pid
      },
      imageName: {
        writable: false,
        value: pinfo.name
      },
      log: {
        writable: false,
        value: new Logger(`[${pinfo.id}) ${pinfo.name}]`)
      },
      memory: {
        get() {
          self.processMemory[pinfo.ns] = self.processMemory[pinfo.ns] || {};
          return self.processMemory[pinfo.ns];
        }
      }
    });
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
      if (this.processTable[id].pid === pinfo.id) {
        this.killProcess(id);
      }
    }
  }

  getProcessById(id: PosisPID): IPosisProcess | undefined {
    return this.processTable[id] && this.processTable[id].status === "running" && (this.processInstanceCache[id] || this.createProcess(id));
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
      if (proc) ids.push(proc.id.toString());
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