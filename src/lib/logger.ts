type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  [key: string]: unknown;
}

function write(level: LogLevel, msg: string, payload?: LogPayload) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...payload,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, payload?: LogPayload) => write("info", msg, payload),
  warn: (msg: string, payload?: LogPayload) => write("warn", msg, payload),
  error: (msg: string, payload?: LogPayload) => write("error", msg, payload),
};
