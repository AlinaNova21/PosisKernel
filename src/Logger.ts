export enum LogLevel {
  DEBUG = 0,
  INFO,
  ALERT,
  WARN,
  ERROR,
  FATAL
}

// Use for HTML styling (Colors match screeps_console)
export const styles = {
  default:           "color: white; background-color: black",
  [LogLevel.DEBUG]:  "color: darkblue",
  [LogLevel.INFO]:   "color: darkgreen",
  [LogLevel.ALERT]:  "color: cyan",
  [LogLevel.WARN]:   "color: white",
  [LogLevel.ERROR]:  "color: red",
  [LogLevel.FATAL]:  "color: yellow; background-color: red",
};

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
    }
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