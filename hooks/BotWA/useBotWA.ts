import { useMutation, useQuery } from "@tanstack/react-query";

// Types
interface Recipient {
  number: string;
  name?: string;
  /**
   * Teks final yang sudah dirender. Dipakai halaman absen/tahfidz yang memilih
   * template acak per siswa; worker tidak bisa mereproduksinya.
   */
  message?: string;
}

interface BulkSendRequest {
  recipients: Recipient[];
  /** Teks bersama untuk semua penerima; `{name}` diganti per penerima. */
  message?: string;
  delayMs?: number;
}

/**
 * Response hanya berarti "sudah masuk antrian" — bukan "sudah terkirim".
 * Pengiriman dilakukan worker terpisah; kegagalan permanen berakhir di
 * queue `botwa.bulk.dlq`.
 */
interface BulkSendResponse {
  batchId: string;
  accepted: number;
  rejected: number;
}

interface ConnectionStatus {
  connection: string;
  state?: string;
  instance?: string;
  message?: string;
}

// Check WhatsApp bot connection status
export const useGetConnectionBotWa = () => {
  return useQuery<ConnectionStatus>({
    queryKey: ["botwa-connection"],
    queryFn: async () => {
      const response = await fetch("/api/botwa/bulk/send");
      if (!response.ok) {
        throw new Error("Failed to check connection status");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

// Bulk send WhatsApp messages — fire and forget, hanya memasukkan ke antrian.
export const useBulkSendWhatsApp = () => {
  return useMutation<BulkSendResponse, Error, BulkSendRequest>({
    mutationFn: async (data: BulkSendRequest) => {
      const response = await fetch("/api/botwa/bulk/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengirim pesan");
      }

      return response.json();
    },
  });
};
