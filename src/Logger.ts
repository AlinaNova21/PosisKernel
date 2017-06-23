

// Use for HTML styling (Colors match screeps_console)
export const styles = {
  default:           "color: white; background-color: black",
  [LogLevel.SILLY]:  "color: darkblue",
  [LogLevel.DEBUG]:  "color: darkblue",
  [LogLevel.INFO]:   "color: darkgreen",
  [LogLevel.ALERT]:  "color: cyan",
  [LogLevel.WARN]:   "color: white",
  [LogLevel.ERROR]:  "color: red",
  [LogLevel.FATAL]:  "color: yellow; background-color: red",
};

let y = 0;
let tick = 0;

export class Logger implements IPosisLogger {
  private prefix: string;
  public level: LogLevel = LogLevel.INFO;

  constructor(prefix = "") {
    this.prefix = prefix;
  }

  private log(level: LogLevel, message: (() => string) | string): void {
    if (level >= this.level) {
      if (typeof message === "function") {
        message = message();
      }
      let style = styles[level] || styles.default;
      console.log(`<log severity="${level}" style="${style}">[${level}] ${this.prefix} ${message}</log>`);
      this.vlog(level, `[${level}] ${this.prefix} ${message}`)
    }
  }
  private vlog(level: LogLevel, message: string): void {
    if (tick != Game.time) y = 0.2
    tick = Game.time
    let style = styles[level] || styles.default;
    let color = style.match(/color: ([a-z]*)/)[1]
    let vis = new RoomVisual()
    vis.text(message, 0, y, { align: 'left', color })
    y += 0.8
  }
  debug (message: (() => string) | string): void {
    this.log(LogLevel.DEBUG, message);
  }
  info (message: (() => string) | string): void {
    this.log(LogLevel.INFO, message);
  }
  warn (message: (() => string) | string): void {
    this.log(LogLevel.WARN, message);
  }
  alert (message: (() => string) | string): void {
    this.log(LogLevel.ALERT, message);
  }
  error (message: (() => string) | string): void {
    this.log(LogLevel.ERROR, message);
  }
  fatal (message: (() => string) | string): void {
    this.log(LogLevel.FATAL, message);
  }
}