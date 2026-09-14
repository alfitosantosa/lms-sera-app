import { useMutation, useQuery } from '@tanstack/react-query';

// Types
interface Recipient {
  number: string;
  name?: string;
}

interface BulkSendRequest {
  recipients: Recipient[];
  message: string;
  delayMs?: number;
}

interface SendResult {
  number: string;
  name?: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BulkSendResponse {
  totalSent: number;
  totalFailed: number;
  results: SendResult[];
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

// Bulk send WhatsApp messages
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
        throw new Error(error.error || "Failed to send messages");
      }

      return response.json();
    },
  });
};

// Helper hook to send WhatsApp to students' parent phones
export const useSendToParents = () => {
  const bulkSend = useBulkSendWhatsApp();

  const sendToParentPhones = async (
    students: { name: string; parentPhone?: string | null }[],
    message: string,
    delayMs?: number
  ) => {
    const validStudents = students.filter(
      (s) => s.parentPhone && s.parentPhone.trim() !== ""
    );

    if (validStudents.length === 0) {
      throw new Error("No valid parent phone numbers found");
    }

    const recipients: Recipient[] = validStudents.map((s) => ({
      number: s.parentPhone!,
      name: s.name,
    }));

    return bulkSend.mutateAsync({
      recipients,
      message,
      delayMs,
    });
  };

  return {
    sendToParentPhones,
    ...bulkSend,
  };
};
