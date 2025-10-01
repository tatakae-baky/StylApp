const AdminOrderNotificationEmail = (customerName, order, customerEmail, deliveryAddress) => {
    return `<!DOCTYPE html>
<html>
<head>
    <title>New Order Notification - Admin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #FF9800;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 22px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
        }
        .order-details, .address-details {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
        }
        .order-details th, .order-details td,
        .address-details th, .address-details td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        .order-details th, .address-details th {
            background: #f8f8f8;
        }
        .section-title {
            background: #2196F3;
            color: white;
            padding: 8px;
            margin: 15px 0 10px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #666;
        }
        .urgent {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 10px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">🔔 New Order Alert - Admin Dashboard</div>
        <div class="content">
            <div class="urgent">
                <strong>ACTION REQUIRED:</strong> New order received and requires processing
            </div>
            
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Order ID:</strong> #${order?._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order?.date || Date.now()).toLocaleString('en-BD')}</p>
            <p><strong>Payment Status:</strong> ${order?.payment_status || 'Cash on Delivery'}</p>

            <div class="section-title">📦 Order Products</div>
            <table class="order-details">
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                </tr>
                ${order?.products?.map(
                    (product) => `
                    <tr>
                        <td>
                            ${product?.productTitle}
                            ${product?.size ? `<br><small style="color: #666;">Size: ${product.size}</small>` : ''}
                        </td>
                        <td>${product?.quantity}</td>
                        <td>Tk${(product?.subTotal / product?.quantity)?.toLocaleString("en-BD")}</td>
                        <td>Tk${product?.subTotal?.toLocaleString("en-BD")}</td>
                    </tr>
                    `
                ).join('')}
                
                <tr style="background: #f0f0f0;">
                    <td colspan="3"><strong>Subtotal</strong></td>
                    <td><strong>Tk${(order?.totalAmt || 0)?.toLocaleString("en-BD")}</strong></td>
                </tr>
                
                <tr style="background: #f0f0f0;">
                    <td colspan="3"><strong>Shipping Charge ${order?.brandDeliveryData?.numberOfBrands > 1 ? `(${order.brandDeliveryData.numberOfBrands} brands × Tk${order.brandDeliveryData.deliveryChargePerBrand})` : ''}</strong></td>
                    <td><strong>Tk${(order?.shippingCharge || 0)?.toLocaleString("en-BD")}</strong></td>
                </tr>
                
                <tr style="background: #e8f5e8; font-weight: bold;">
                    <td colspan="3"><strong>TOTAL AMOUNT</strong></td>
                    <td><strong>Tk${(order?.totalWithShipping || 0)?.toLocaleString("en-BD")}</strong></td>
                </tr>
            </table>
            
            ${order?.brandDeliveryData?.numberOfBrands > 1 ? `
            <div class="urgent">
                <strong>MULTI-BRAND ORDER:</strong> This order contains products from ${order.brandDeliveryData.numberOfBrands} different brands. 
                Each brand will handle their own shipping (Tk${order.brandDeliveryData.deliveryChargePerBrand} per brand).
            </div>
            ` : ''}

            <div class="section-title">🏠 Delivery Address</div>
            <table class="address-details">
                <tr>
                    <th>Field</th>
                    <th>Details</th>
                </tr>
                <tr>
                    <td><strong>Address Line 1</strong></td>
                    <td>${deliveryAddress?.address_line1 || 'N/A'}</td>
                </tr>
                ${deliveryAddress?.street ? `
                <tr>
                    <td><strong>Street</strong></td>
                    <td>${deliveryAddress.street}</td>
                </tr>
                ` : ''}
                ${deliveryAddress?.apartmentName ? `
                <tr>
                    <td><strong>Apartment</strong></td>
                    <td>${deliveryAddress.apartmentName}</td>
                </tr>
                ` : ''}
                <tr>
                    <td><strong>City</strong></td>
                    <td>${deliveryAddress?.city || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Postcode</strong></td>
                    <td>${deliveryAddress?.postcode || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Mobile</strong></td>
                    <td>${deliveryAddress?.mobile || 'N/A'}</td>
                </tr>
                ${deliveryAddress?.landmark ? `
                <tr>
                    <td><strong>Landmark</strong></td>
                    <td>${deliveryAddress.landmark}</td>
                </tr>
                ` : ''}
                <tr>
                    <td><strong>Address Type</strong></td>
                    <td>${deliveryAddress?.addressType || 'N/A'}</td>
                </tr>
            </table>

            <div class="urgent">
                <strong>Next Steps:</strong>
                <ul>
                    <li>Process order in admin dashboard</li>
                    <li>Coordinate with relevant brands for fulfillment</li>
                    <li>Monitor order status and customer communication</li>
                    <li>Update shipping tracking when available</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            Admin Dashboard | Styl' Bangladesh | ${new Date().getFullYear()}
        </div>
    </div>
</body>
</html>`;
};

export default AdminOrderNotificationEmail;
