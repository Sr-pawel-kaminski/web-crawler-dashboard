import { Chip } from "@mui/material";

const colorMap: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  queued: "default",
  running: "primary",
  done: "success",
  error: "error",
  stopped: "warning",
};

export function StatusChip({ status }: { status: string }) {
  return <Chip label={status} color={colorMap[status] || "default"} size="small" />;
} 