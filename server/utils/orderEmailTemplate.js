const OrderConfirmationEmail = (username, orders, deliveryAddress = null) => {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Order Received - Styl' Bangladesh</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #FF2E4D;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            margin-bottom: 15px;
        }
        .header-title {
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px;
        }
        .order-header {
            border-bottom: 2px solid #f1f1f1;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .order-number {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 0 0 5px 0;
        }
        .order-date {
            color: #666;
            font-size: 14px;
            margin: 0;
        }
        .greeting {
            margin-bottom: 20px;
            font-size: 16px;
        }
        .thank-you {
            margin-bottom: 30px;
            color: #666;
            line-height: 1.5;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 25px 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #333;
            border-bottom: 2px solid #dee2e6;
        }
        .items-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #dee2e6;
            color: #333;
        }
        .item-name {
            font-weight: 500;
        }
        .summary-table {
            width: 100%;
            margin-top: 20px;
        }
        .summary-table td {
            padding: 8px 12px;
            text-align: right;
        }
        .summary-row {
            border-bottom: 1px solid #dee2e6;
        }
        .total-row {
            font-weight: bold;
            font-size: 16px;
            background: #f8f9fa;
        }
        .total-row td {
            padding: 12px;
            border-top: 2px solid #FF2E4D;
        }
        .address-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .address-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .address-block h4 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .address-content {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }
        .info-section {
            background: #fff3e0;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #FF9800;
            margin: 20px 0;
        }
        .status-button {
            background: #FF2E4D;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 20px 0;
        }
        .footer {
            background: #333;
            color: #ccc;
            text-align: center;
            padding: 25px;
            font-size: 12px;
        }
        .footer-links {
            margin-bottom: 10px;
        }
        .footer-links a {
            color: #FF2E4D;
            text-decoration: none;
            margin: 0 10px;
        }
        @media (max-width: 600px) {
            .address-grid {
                grid-template-columns: 1fr;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <svg width="120" height="45" viewBox="0 0 194 183" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M175.827 28.1928L187.769 24.9398L188.288 27.1084L187.769 28.7349L187.25 30.3614L186.212 32.5301L184.654 34.6988L183.096 36.3253L181.538 37.9518L179.981 39.5783L178.942 40.6627L177.904 41.747L177.385 42.8313V43.9157L177.904 44.4578L178.423 45H179.462H181.019L182.058 43.9157L184.135 41.747L186.212 39.5783L188.808 36.3253L190.885 33.6145L192.442 30.3614L193.481 27.6506L194 24.3976V21.6867L193.481 18.9759L192.962 16.8072L188.288 3.79518L187.769 2.71084L187.25 1.62651L186.212 0.542169L185.173 0L168.558 4.87952L167.519 5.42169L167 6.50602V7.59036L171.673 25.4819L172.192 26.5663L172.712 27.1084L173.231 27.6506L174.788 28.1928H175.827Z" fill="white"/>
                    <path d="M143.005 183H18.5C7.5 183 -7.32517 176.295 13.7402 159.053L49.647 127.922L1.77122 44.1086C-1.42049 35.3281 -2.53758 18.246 18.5278 20.1618L141.5 20.1618C149.5 20.1617 162.66 22.0898 155 35.5L114.277 77.6361L157.367 159.053C162.156 167.035 165.987 183 143.005 183Z" fill="white"/>
                </svg>
            </div>
                <h1 class="header-title">Order Received</h1>
        </div>
        
        <div class="content">
            <div class="order-header">
                <h2 class="order-number">ORDER #${
                  orders?._id
                    ? String(orders._id).slice(-8).toUpperCase()
                    : "N/A"
                }</h2>
                <p class="order-date">${new Date(
                  orders?.date || Date.now()
                ).toLocaleDateString("en-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
            </div>

            <div class="greeting">
                <strong>Hi ${username},</strong>
            </div>
            
            <p class="thank-you">
                Thank you for your order! We have received your order and will process it shortly. We will send you another email once your order is confirmed and ready to ship.
            </p>

            <h3 class="section-title">Items Ordered</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders?.products?.map(product => `
                        <tr>
                            <td class="item-name">
                                ${product?.productTitle || 'Product'}
                                ${product?.size ? `<br><small style="color: #666; font-size: 12px;">Size: ${product.size}</small>` : ''}
                            </td>
                            <td style="text-align: center;">× ${product?.quantity || 1}</td>
                            <td style="text-align: right;">Tk${product?.subTotal?.toLocaleString("en-BD") || '0'}</td>
                        </tr>
                    `).join('') || ''}
                </tbody>
            </table>

            <table class="summary-table">
                <tr class="summary-row">
                    <td style="text-align: left; padding-left: 0;"><strong>Subtotal</strong></td>
                    <td><strong>Tk${(orders?.totalAmt || 0)?.toLocaleString(
                      "en-BD"
                    )}</strong></td>
                </tr>
                <tr class="summary-row">
                    <td style="text-align: left; padding-left: 0;"><strong>Shipping ${orders?.brandDeliveryData?.numberOfBrands > 1 ? `(${orders.brandDeliveryData.numberOfBrands} brands × Tk${orders.brandDeliveryData.deliveryChargePerBrand})` : ''}</strong></td>
                    <td><strong>Tk${(
                      orders?.shippingCharge || 0
                    )?.toLocaleString("en-BD")}</strong></td>
                </tr>
                <tr class="total-row">
                    <td style="text-align: left; padding-left: 0;"><strong>Total</strong></td>
                    <td><strong>Tk${(
                      orders?.totalWithShipping ||
                      orders?.totalAmt ||
                      0
                    )?.toLocaleString("en-BD")}</strong></td>
                </tr>
            </table>
            
            ${orders?.brandDeliveryData?.numberOfBrands > 1 ? `
            <div class="info-section">
                <h4 style="margin: 15px 0 10px 0; color: #333;">Delivery Information</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>Multiple Brand Order:</strong> Your order includes products from ${orders.brandDeliveryData.numberOfBrands} different brands. 
                    Each brand charges Tk${orders.brandDeliveryData.deliveryChargePerBrand} for delivery, as they ship independently.
                    <br><br>
                    <strong>Expected Delivery:</strong> 3-5 business days from order confirmation.
                </p>
            </div>
            ` : ''}

            ${
              deliveryAddress
                ? `
            <div class="address-section">
                <div class="address-grid">
                    <div class="address-block">
                        <h4>Shipping Address</h4>
                        <div class="address-content">
                            Name : ${username}<br>
                            Address Line : ${deliveryAddress?.address_line1 || ""}<br>
                            Street : ${
                              deliveryAddress?.street
                                ? deliveryAddress.street + "<br>"
                                : ""
                            }
                            ${deliveryAddress?.city || ""}, ${deliveryAddress?.postcode || ""}<br>
                            Tel. ${deliveryAddress?.mobile || "N/A"}
                        </div>
                    </div>
                </div>
            </div>
            `
                : ""
            }

            <div class="info-section">
                <h4 style="margin: 0 0 10px 0; color: #333;">Payment Info</h4>
                <p style="margin: 0; color: #666;">
                    <strong>${
                      orders?.payment_status || "Cash on Delivery"
                    }</strong> 
                    ${
                      orders?.payment_status !== "Cash on Delivery"
                        ? `Tk ${(
                            orders?.totalWithShipping ||
                            orders?.totalAmt ||
                            0
                          )?.toLocaleString("en-BD")}`
                        : ""
                    }
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="#">Support</a> |
                <a href="#">Returns</a> |
                <a href="#">Privacy Policy</a>
            </div>
            <p style="margin: 0;">
                <em>If you have any questions, please contact us at</em><br>
                <strong>support@styl'-bd.com</strong> or <strong>+880 1234-567890</strong>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Styl' Bangladesh. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};

export default OrderConfirmationEmail;
