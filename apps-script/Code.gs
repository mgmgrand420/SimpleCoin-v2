// Google Apps Script: SimpleCoin v2 Backend

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getOrCreateSheet();
    const orderId = generateOrderID();
    const timestamp = new Date();

    // Append order to sheet
    ss.appendRow([
      orderId,
      timestamp,
      data.customerName,
      data.customerEmail,
      data.shippingAddress,
      JSON.stringify(data.items),
      data.subtotal,
      data.shipping,
      0, // tax placeholder
      data.total,
      "Static Stripe Link",
      data.orderNotes,
      "Pending",
      ""
    ]);

    // Send emails
    const emailBody = `
      <h2>Thank you for your order!</h2>
      <p>Order ID: ${orderId}</p>
      <p>Total: $${data.total}</p>
      <p>Items:</p>
      <ul>${data.items.map(i => `<li>${i.name} x${i.quantity} - $${i.price}</li>`).join('')}</ul>
      <p>Shipping: ${data.shippingAddress}</p>
    `;
    MailApp.sendEmail({
      to: data.customerEmail,
      subject: `Your SimpleCoin Order #${orderId}`,
      htmlBody: emailBody
    });
    MailApp.sendEmail({
      to: "store-owner@example.com",
      subject: `New SimpleCoin Order #${orderId}`,
      htmlBody: emailBody
    });

    return ContentService.createTextOutput("Success");
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err);
  }
}

function getOrCreateSheet() {
  const sheetName = "SimpleCoin Orders";
  let ss;
  const sheets = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(sheetName);
  ss = sheets.getSheetByName(sheetName);
  if (!ss) {
    ss = sheets.insertSheet(sheetName);
    ss.appendRow([
      'OrderID','Timestamp','CustomerName','CustomerEmail','ShippingAddress','Items',
      'Subtotal','Shipping','Tax','Total','PaymentLink','OrderNotes','Status','FulfillmentNotes'
    ]);
  }
  return ss;
}

function generateOrderID() {
  const date = new Date();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SC2-${date.getFullYear()}${date.getMonth()+1}${date.getDate()}-${random}`;
}
