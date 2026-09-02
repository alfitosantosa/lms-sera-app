// export async function

// get status form order id
// after that check the transaction status  = pending || expired || settlement
// if settelment {
//   set true for the payment in database
//   return ok
// }

// if pending {
//   snap for an transaction token
//   return the token
// }

// if expired {
// {
//     "status_code": "407",
//     "transaction_id": "d4a9ccd0-a9f7-427a-adb4-618420f4e5a2",
//     "gross_amount": "500.00",
//     "currency": "IDR",
//     "order_id": "KWT-09QQCVL1DARQDW3EAAAA",
//     "payment_type": "qris",
//     "signature_key": "58a7b5d774dd6f64b808c4e8eaec6bd06a7b4877b2d5c669dd6365039ec25ab869343898a07841bccee64b2f69b30310daa6efe58702c136fca62c10a22ecd56",
//     "transaction_status": "expire",
//     "fraud_status": "accept",
//     "status_message": "Success, transaction is found",
//     "merchant_id": "G145008745",
//     "transaction_time": "2026-04-09 01:16:31",
//     "expiry_time": "2026-04-09 01:31:31"
// }
//   delete the current transaction in database
//   create new transaction with same order_id
//   with the same order_id
//   generate again the transaction token
//   return transaction token
// }

// export async function handlePaymentStatus(orderId: string) {
//   const order = await getOrderById(orderId);
//   if (!order) {
//     throw new Error("Order not found");
//   }

//   const transactionStatus = await checkTransactionStatus(order.transactionId);

//   if (transactionStatus === "settlement") {
//     return await handleSettlement(orderId);
//   }
//   if (transactionStatus === "pending") {
//     const transactionToken = await generateTransactionToken(order);
//     return { transactionToken };
//   }
//   if (transactionStatus === " expired") {
//     await deleteTransaction(orderId);
//     const newOrder = await createNewTransaction(order);
//     const transactionToken = await generateTransactionToken(newOrder);
//     return { transactionToken };
//   }
// }
