import { toast } from "sonner";

export function errorHandlerFrontend(error: unknown): void {
  const message = error instanceof Error ? error.message : "Unknown error";
  toast.error(message);
}
