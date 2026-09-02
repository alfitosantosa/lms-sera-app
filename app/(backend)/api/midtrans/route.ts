import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    const snap = new midtransClient.Snap({
      isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    });

    const transaction = await snap.createTransaction(requestBody);

    return new Response(JSON.stringify(transaction), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Midtrans transaction:", error);
    return new Response(JSON.stringify({ error: "Failed to create transaction" }), { status: 500 });
  }
}
