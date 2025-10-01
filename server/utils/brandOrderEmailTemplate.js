const BrandOrderNotificationEmail = (brandName, customerName, order, brandProducts, deliveryAddress) => {
    // Calculate individual brand shipping charge (80 for Dhaka, 120 for outside Dhaka)
    const isDhaka = deliveryAddress?.city?.toLowerCase().includes('dhaka');
    const brandShippingCharge = isDhaka ? 80 : 120;
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>New Order Notification - ${brandName}</title>
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
            background: #9C27B0;
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
            background: #673AB7;
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
        .brand-highlight {
            background: #e8f5e8;
            border-left: 4px solid #4CAF50;
            padding: 10px;
            margin: 10px 0;
        }
        .fulfillment-info {
            background: #fff3e0;
            border-left: 4px solid #FF9800;
            padding: 10px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">New Order - ${brandName}</div>
        <div class="content">
            <div class="brand-highlight">
                <strong>Dear ${brandName} Team,</strong><br>
                You have received a new order for your products. Please prepare for fulfillment.
            </div>
            
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Order ID:</strong> #${order?._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order?.date || Date.now()).toLocaleString('en-BD')}</p>

            <div class="section-title">Your Products in This Order</div>
            <table class="order-details">
                <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
                ${brandProducts?.map(
                    (product) => `
                    <tr>
                        <td>
                            <strong>${product?.productTitle}</strong>
                            ${product?.size ? `<br><small style="color: #666;">Size: ${product.size}</small>` : ''}
                        </td>
                        <td>${product?.quantity}</td>
                        <td>Tk${(product?.subTotal / product?.quantity)?.toLocaleString("en-BD")}</td>
                        <td>Tk${product?.subTotal?.toLocaleString("en-BD")}</td>
                    </tr>
                    `
                ).join('')}
                
                <tr style="background: #f0f0f0;">
                    <td colspan="3"><strong>Products Subtotal</strong></td>
                    <td><strong>Tk${brandProducts?.reduce((total, product) => total + (product?.subTotal || 0), 0)?.toLocaleString("en-BD")}</strong></td>
                </tr>
                
                <tr style="background: #f0f0f0;">
                    <td colspan="3"><strong>Shipping Charge</strong></td>
                    <td><strong>Tk${brandShippingCharge?.toLocaleString("en-BD")}</strong></td>
                </tr>
                
                <tr style="background: #e8f5e8; font-weight: bold;">
                    <td colspan="3"><strong>Total Amount for ${brandName}</strong></td>
                    <td><strong>Tk${(brandProducts?.reduce((total, product) => total + (product?.subTotal || 0), 0) + brandShippingCharge)?.toLocaleString("en-BD")}</strong></td>
                </tr>
            </table>

            <div class="section-title">Delivery Information</div>
            <table class="address-details">
                <tr>
                    <th>Delivery Details</th>
                    <th>Information</th>
                </tr>
                <tr>
                    <td><strong>Customer Name</strong></td>
                    <td>${customerName}</td>
                </tr>
                <tr>
                    <td><strong>Address</strong></td>
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
                    <td><strong>Contact Number</strong></td>
                    <td>${deliveryAddress?.mobile || 'N/A'}</td>
                </tr>
                ${deliveryAddress?.landmark ? `
                <tr>
                    <td><strong>Landmark</strong></td>
                    <td>${deliveryAddress.landmark}</td>
                </tr>
                ` : ''}
            </table>

            <div class="fulfillment-info">
                <strong>📋 Fulfillment Requirements:</strong>
                <ul>
                    <li><strong>You will receive:</strong> Tk${(brandProducts?.reduce((total, product) => total + (product?.subTotal || 0), 0) + brandShippingCharge)?.toLocaleString("en-BD")} (Products + Shipping)</li>
                    <li><strong>Shipping Responsibility:</strong> You handle shipping directly to customer</li>
                    <li><strong>Expected Delivery:</strong> 3-5 business days</li>
                    <li><strong>Payment:</strong> ${order?.payment_status || 'Cash on Delivery'}</li>
                    <li>Please prepare and ship items directly to the customer address below</li>
                </ul>
            </div>

            <div class="brand-highlight">
                <strong>⏰ Action Required:</strong><br>
                Please confirm product availability and prepare items for direct shipping to customer. You are responsible for the complete fulfillment including shipping. Contact our admin team if you have any questions about this order.
            </div>
        </div>
        <div class="footer">
            ${brandName} | Partner with Styl' Bangladesh | ${new Date().getFullYear()}
        </div>
    </div>
</body>
</html>`;
};

export default BrandOrderNotificationEmail;
