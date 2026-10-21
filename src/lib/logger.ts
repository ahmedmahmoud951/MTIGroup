type LogLevel = "debug" | "info" | "success" | "warn" | "error";

interface LogPayload {
  [key: string]: any;
}

class TerminalLogger {
  private isBrowser = typeof window !== "undefined";

  private getTimestamp(): string {
    const now = new Date();
    return now.toTimeString().split(" ")[0] + "." + now.getMilliseconds().toString().padStart(3, "0");
  }

  private print(level: LogLevel, tag: string, message: string, data?: any) {
    const time = this.getTimestamp();

    if (this.isBrowser) {
      // Browser Console with stylish CSS
      let color = "#38bdf8"; // default cyan
      let icon = "ℹ️";

      switch (level) {
        case "success":
          color = "#10b981";
          icon = "✅";
          break;
        case "warn":
          color = "#f59e0b";
          icon = "⚠️";
          break;
        case "error":
          color = "#f43f5e";
          icon = "❌";
          break;
        case "debug":
          color = "#94a3b8";
          icon = "🔍";
          break;
        default:
          color = "#0ea5e9";
          icon = "🌐";
      }

      if (tag === "SignalR") {
        color = "#14b8a6";
        icon = "📡";
      } else if (tag === "Auth") {
        color = "#a855f7";
        icon = "🔐";
      }

      const styleTag = `color: #fff; background: ${color}; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px;`;
      const styleTime = "color: #64748b; font-size: 10px;";
      const styleMsg = `color: ${level === "error" ? "#f43f5e" : "#f1f5f9"}; font-weight: ${level === "error" ? "bold" : "normal"};`;

      if (data !== undefined) {
        console.groupCollapsed(`%c${icon} ${tag}%c ${time} %c${message}`, styleTag, styleTime, styleMsg);
        console.log("Payload:", data);
        console.groupEnd();
      } else {
        console.log(`%c${icon} ${tag}%c ${time} %c${message}`, styleTag, styleTime, styleMsg);
      }

      // Stream to Next.js server terminal so PowerShell displays all actions live
      try {
        fetch("/api/terminal-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level,
            tag,
            message,
            data: data !== undefined ? (typeof data === "object" ? data : String(data)) : undefined,
            timestamp: time,
          }),
        }).catch(() => {});
      } catch {
        // Ignore terminal sync error in browser
      }
    } else {
      // Node.js Terminal Output with ANSI colors
      let colorCode = "\x1b[36m"; // Cyan
      let icon = "[INFO]";

      switch (level) {
        case "success":
          colorCode = "\x1b[32m"; // Green
          icon = "[SUCCESS]";
          break;
        case "warn":
          colorCode = "\x1b[33m"; // Yellow
          icon = "[WARN]";
          break;
        case "error":
          colorCode = "\x1b[31m"; // Red
          icon = "[ERROR]";
          break;
        case "debug":
          colorCode = "\x1b[90m"; // Gray
          icon = "[DEBUG]";
          break;
        default:
          colorCode = "\x1b[36m";
          icon = "[INFO]";
      }

      const reset = "\x1b[0m";
      const gray = "\x1b[90m";
      const tagText = `${colorCode}[${tag}]${reset}`;
      const timeText = `${gray}${time}${reset}`;

      if (data !== undefined) {
        console.log(`${timeText} ${tagText} ${message}`);
        console.dir(data, { depth: 3, colors: true });
      } else {
        console.log(`${timeText} ${tagText} ${message}`);
      }
    }
  }

  // Domain-specific helpers
  api(message: string, data?: any) {
    this.print("info", "API", message, data);
  }

  apiSuccess(message: string, data?: any) {
    this.print("success", "API", message, data);
  }

  apiError(message: string, err?: any) {
    this.print("error", "API", message, err);
  }

  signalr(message: string, data?: any) {
    this.print("info", "SignalR", message, data);
  }

  signalrEvent(eventName: string, payload: any) {
    this.print("success", "SignalR", `Event Received: ${eventName}`, payload);
  }

  signalrWarn(message: string, data?: any) {
    this.print("warn", "SignalR", message, data);
  }

  signalrError(message: string, err?: any) {
    this.print("error", "SignalR", message, err);
  }

  auth(message: string, data?: any) {
    this.print("info", "Auth", message, data);
  }

  authSuccess(message: string, data?: any) {
    this.print("success", "Auth", message, data);
  }

  authError(message: string, err?: any) {
    this.print("error", "Auth", message, err);
  }

  info(tag: string, message: string, data?: any) {
    this.print("info", tag, message, data);
  }

  warn(tag: string, message: string, data?: any) {
    this.print("warn", tag, message, data);
  }

  error(tag: string, message: string, err?: any) {
    this.print("error", tag, message, err);
  }
}

export const logger = new TerminalLogger();
export default logger;
