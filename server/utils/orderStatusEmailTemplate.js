const OrderStatusUpdateEmail = (username, order, newStatus, brandName = null) => {
    const getStatusMessage = (status) => {
        switch(status) {
            case 'confirmed':
                return {
                    title: 'Order Confirmed!',
                    message: 'Great news! Your order has been confirmed and is being prepared.',
                    color: '#2196F3'
                };
            case 'shipped':
                return {
                    title: 'Order Shipped!',
                    message: 'Your order is on its way! It should arrive within 1-3 business days.',
                    color: '#9C27B0'
                };
            case 'delivered':
                return {
                    title: 'Order Delivered!',
                    message: 'Your order has been successfully delivered. Thank you for shopping with us!',
                    color: '#4CAF50'
                };
            default:
                return {
                    title: 'Order Update',
                    message: 'Your order status has been updated.',
                    color: '#666'
                };
        }
    };

    const statusInfo = getStatusMessage(newStatus);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Order Status Update - Styl' Bangladesh</title>
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
            background: ${statusInfo.color};
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
        .status-message {
            margin-bottom: 30px;
            color: #666;
            line-height: 1.5;
        }
        .status-badge {
            background: ${statusInfo.color};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.5px;
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
            border-top: 2px solid ${statusInfo.color};
        }
        .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
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
            color: ${statusInfo.color};
            text-decoration: none;
            margin: 0 10px;
        }
        @media (max-width: 600px) {
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
            <h1 class="header-title">${statusInfo.title}</h1>
        </div>
        
        <div class="content">
            <div class="order-header">
                <h2 class="order-number">ORDER #${order._id ? String(order._id).slice(-8).toUpperCase() : 'N/A'}</h2>
                <p class="order-date">${new Date(order.createdAt || order.date).toLocaleDateString('en-BD', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
            </div>

            <div class="greeting">
                <strong>Hi ${username},</strong>
            </div>
            
            <p class="status-message">
                ${statusInfo.message} ${brandName ? `Your ${brandName} products are being processed by the brand.` : ''}
            </p>

            <div class="status-badge">${newStatus.toUpperCase()}</div>

            <h3 class="section-title">Order Details</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order?.products?.map(product => `
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
                    <td><strong>Tk${(order?.totalAmt || 0)?.toLocaleString("en-BD")}</strong></td>
                </tr>
                <tr class="summary-row">
                    <td style="text-align: left; padding-left: 0;"><strong>Shipping ${order?.brandDeliveryData?.numberOfBrands > 1 ? `(${order.brandDeliveryData.numberOfBrands} brands × Tk${order.brandDeliveryData.deliveryChargePerBrand})` : ''}</strong></td>
                    <td><strong>Tk${(order?.shippingCharge || 0)?.toLocaleString("en-BD")}</strong></td>
                </tr>
                <tr class="total-row">
                    <td style="text-align: left; padding-left: 0;"><strong>Total</strong></td>
                    <td><strong>Tk${(order.totalWithShipping || order.totalAmt || 0)?.toLocaleString("en-BD")}</strong></td>
                </tr>
            </table>

            <div class="info-section">
                <p style="margin: 0;">
                    You can view your complete order details by logging into your account on our website.
                </p>
            </div>

            <p style="margin: 20px 0;">
                Thank you for choosing Styl' Bangladesh!
            </p>
            
            <p style="margin-bottom: 0;">
                Best regards,<br>
                <strong>The Styl' Bangladesh Team</strong>
            </p>
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

export default OrderStatusUpdateEmail;
