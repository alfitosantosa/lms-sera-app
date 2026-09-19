"use client";
import { useGetConnectionBotWa } from "@/app/(hooks)/hooks/BotWA/useBotWA";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";

export default function WaPage() {
  const { data: connection, isLoading, isError } = useGetConnectionBotWa();

  return (
    <div className="max-w-8xl">
      <div className="mb-3 text-3xl font-bold">
        WhatsApp Bot Connection Status
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connection?.connection === "success" ? (
              <Wifi className="text-success h-5 w-5" />
            ) : (
              <WifiOff className="text-destructive h-5 w-5" />
            )}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : isError ? (
            <Badge variant="destructive">Error connecting</Badge>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge
                  variant={
                    connection?.connection === "success"
                      ? "default"
                      : "destructive"
                  }
                >
                  {connection?.connection || "Unknown"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Instance:</span>
                <span>{connection?.instance || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">State:</span>
                <span>{connection?.state || "N/A"}</span>
              </div>
              {connection?.message && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Message:</span>
                  <span className="text-destructive">{connection.message}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
