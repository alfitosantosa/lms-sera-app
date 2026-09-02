"use client";
import { useGetConnectionBotWa } from '@/app/(hooks)/hooks/BotWA/useBotWA';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff } from 'lucide-react';

export default function WaPage() {
  const { data: connection, isLoading, isError } = useGetConnectionBotWa();

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto my-8 p-6">
      <div className="font-bold text-3xl mb-3">WhatsApp Bot Connection Status</div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connection?.connection === "success" ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
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
                <Badge variant={connection?.connection === "success" ? "default" : "destructive"}>{connection?.connection || "Unknown"}</Badge>
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
                  <span className="text-red-500">{connection.message}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
