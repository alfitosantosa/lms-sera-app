/**
 * Helper Evolution API (WhatsApp) bersama.
 *
 * Sebelumnya `formatPhoneNumber` + pemanggilan Evolution API disalin di
 * `api/botwa/send` dan `api/botwa/bulk/send`; sekarang keduanya mengimpor dari
 * sini supaya tidak ada salinan ketiga (mis. dari modul pengembangan).
 *
 * Bentuk hasil sengaja **mentah** (`data` + `status`/`statusText`/`errorBody`):
 * tiap route punya kontrak respons sendiri (pesan error & status HTTP berbeda)
 * dan harus tetap sama persis setelah refactor ini.
 */

export type WhatsAppConfig = {
  url: string;
  apikey: string;
  instance: string;
};

/** `null` bila `NEXT_PUBLIC_EVO_URL`/`NEXT_PUBLIC_EVO_APIKEY` tidak diset. */
export function getWhatsAppConfig(): WhatsAppConfig | null {
  const url = process.env.NEXT_PUBLIC_EVO_URL;
  const apikey = process.env.NEXT_PUBLIC_EVO_APIKEY;
  if (!url || !apikey) return null;
  return {
    url,
    apikey,
    instance: process.env.NEXT_PUBLIC_EVO_INSTANCE || "fajarsentosa",
  };
}

/** `08xx` / `8xx` → `628xx` (buang semua non-digit). */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/** Bentuk payload yang dipakai route untuk mengambil `messageId`. */
export type WhatsAppResponsePayload = {
  key?: { id?: string };
  id?: string;
  messageId?: string;
};

export type WhatsAppSendResult =
  | { success: true; data: WhatsAppResponsePayload }
  | {
      success: false;
      error: string;
      /** Status HTTP Evolution API saat membalas non-2xx (untuk pemetaan route). */
      status?: number;
      statusText?: string;
      errorBody?: string;
    };

/** POST `${url}/message/sendText/${instance}` — tidak pernah melempar. */
export async function sendWhatsAppMessage(
  number: string,
  text: string,
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig();
  if (!config) {
    return { success: false, error: "Evolution API configuration missing" };
  }

  try {
    const response = await fetch(
      `${config.url}/message/sendText/${config.instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.apikey,
        },
        body: JSON.stringify({
          number: formatPhoneNumber(number),
          text: text,
        }),
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: `API Error: ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        errorBody: await response.text(),
      };
    }

    return { success: true, data: (await response.json()) as WhatsAppResponsePayload };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
