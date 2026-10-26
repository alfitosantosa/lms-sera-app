import amqp from "amqplib";
import { assertTopology } from "./topology";

/**
 * Koneksi RabbitMQ bersama untuk satu proses.
 *
 * Pemulihan koneksi diserahkan ke fitur recovery bawaan amqplib 2.x
 * (`recovery.setup`), bukan ditulis tangan: `setup` dijalankan ulang setiap kali
 * koneksi berhasil, termasuk setelah reconnect.
 *
 * Penting: recovery amqplib HANYA memulihkan koneksi — channel dan consumer
 * tidak ikut dipulihkan, jadi consumer worker dibuat di dalam `onConnected`.
 */

type OpenOptions = {
  /**
   * `true` (dipakai route API): jangan retry sebelum koneksi pertama, supaya
   * permintaan HTTP gagal cepat dengan 503 alih-alih menggantung.
   * Default (worker): retry tanpa batas agar pulih sendiri saat broker restart.
   */
  failFast?: boolean;
  /** Dipanggil setelah setiap koneksi sukses (awal maupun reconnect). */
  onConnected?: (model: amqp.ChannelModel) => Promise<void>;
};

let modelPromise: Promise<amqp.RecoveringChannelModel> | null = null;
let publishChannel: amqp.ConfirmChannel | null = null;

export function openRabbit(
  options: OpenOptions = {},
): Promise<amqp.RecoveringChannelModel> {
  if (modelPromise) return modelPromise;

  const url = process.env.RABBITMQ_URL;
  if (!url) {
    return Promise.reject(
      new Error("RABBITMQ_URL belum diset di environment"),
    );
  }

  modelPromise = amqp
    .connect(url, {
      recovery: {
        initialMaxRetries: options.failFast ? 0 : Number.POSITIVE_INFINITY,
        setup: async (model: amqp.ChannelModel) => {
          const channel = await model.createChannel();
          try {
            await assertTopology(channel);
          } finally {
            await channel.close();
          }
          await options.onConnected?.(model);
        },
      },
    })
    .catch((error: unknown) => {
      // Jangan cache kegagalan: request berikutnya harus bisa mencoba lagi.
      modelPromise = null;
      throw error;
    });

  return modelPromise;
}

/**
 * Channel confirm untuk producer. Dibuat ulang bila channel ditutup broker
 * (mis. setelah reconnect); `close` selalu menyetel ulang referensinya.
 */
export async function getPublishChannel(): Promise<amqp.ConfirmChannel> {
  const model = await openRabbit({ failFast: true });
  if (publishChannel) return publishChannel;

  const channel = await model.createConfirmChannel();
  channel.on("close", () => {
    if (publishChannel === channel) publishChannel = null;
  });
  channel.on("error", (error: Error) => {
    console.error("[rabbitmq] channel error:", error);
  });

  publishChannel = channel;
  return channel;
}

/** Menutup koneksi dan channel. Aman dipanggil saat shutdown. */
export async function closeRabbit(): Promise<void> {
  const pending = modelPromise;
  modelPromise = null;
  publishChannel = null;
  if (!pending) return;

  try {
    const model = await pending;
    await model.close();
  } catch (error) {
    console.error("[rabbitmq] error saat menutup koneksi:", error);
  }
}
