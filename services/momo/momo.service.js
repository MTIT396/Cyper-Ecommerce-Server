const momoClient = require("../../integrations/momo/momo.query");

exports.checkTransactionStatus = async (payment) => {
  const momoRes = await momoClient.queryTransaction({
    momoOrderId: payment.momo_order_id,
    requestId: `${payment.momo_order_id}-query-${Date.now()}`,
  });
  const isSuccess = momoRes.resultCode === 0;

  return {
    status: isSuccess ? "success" : "failed",
    momoData: momoRes,
  };
};
