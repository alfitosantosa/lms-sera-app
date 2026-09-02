// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");
import { NextRequest, NextResponse } from 'next/server';

// cara pakai GET /api/midtrans/status?orderId=KWT-X2O4AIFK5NVUGR9LAAAA

const getCoreApi = () =>
  new midtransClient.CoreApi({
    isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });

// GET status of a transaction: /api/midtrans/status?orderId=ORDER_ID
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const coreApi = getCoreApi();
    const status = await coreApi.transaction.status(orderId);
    return NextResponse.json(status);
  } catch (error: unknown) {
    console.error("Error getting transaction status:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get transaction status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST for actions: approve | deny | cancel | expire | refund
// Body: { orderId, action, amount?, reason? }
// export async function POST(request: NextRequest) {
//   try {
//     const { orderId, action, amount, reason } = await request.json();

//     if (!orderId || !action) {
//       return NextResponse.json({ error: "orderId and action are required" }, { status: 400 });
//     }

//     const coreApi = getCoreApi();
//     let response;

//     switch (action) {
//       case "approve":
//         response = await coreApi.transaction.approve(orderId);
//         break;
//       case "deny":
//         response = await coreApi.transaction.deny(orderId);
//         break;
//       case "cancel":
//         response = await coreApi.transaction.cancel(orderId);
//         break;
//       case "expire":
//         response = await coreApi.transaction.expire(orderId);
//         break;
//       case "refund":
//         response = await coreApi.transaction.refund(orderId, { amount, reason });
//         break;
//       default:
//         return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
//     }

//     return NextResponse.json(response);
//   } catch (error: any) {
//     console.error("Error processing transaction action:", error);
//     return NextResponse.json({ error: error.message || "Failed to process transaction action" }, { status: 500 });
//   }
// }
