// ===================================
// ORDERS PAGE LOGIC - DEBUG VERSION
// ===================================

let ordersData = [];
let currentOrderId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Page loaded, loading orders...');
    await loadOrders();
});

// Load all orders
async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    
    try {
        console.log('Fetching orders from API...');
        ordersData = await fetchGet(API_ENDPOINTS.ORDERS);
        console.log('Orders loaded:', ordersData);
        
        renderOrders(ordersData);
        calculateStatistics();
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = '<tr><td colspan="10" style="color: red;">Lỗi khi tải dữ liệu: ' + error.message + '</td></tr>';
    }
}

// Calculate statistics
function calculateStatistics() {
    try {
        const pending = ordersData.filter(o => o.status === 'PENDING').length;
        const shipping = ordersData.filter(o => o.status === 'SHIPPING').length;
        const delivered = ordersData.filter(o => o.status === 'DELIVERED').length;
        const cancelled = ordersData.filter(o => o.status === 'CANCELLED').length;
        const rejected = ordersData.filter(o => o.status === 'REJECTED').length;
        
        document.getElementById('pendingOrders').textContent = pending;
        document.getElementById('shippingOrders').textContent = shipping;
        document.getElementById('deliveredOrders').textContent = delivered;
        document.getElementById('cancelledOrders').textContent = cancelled;
        const rejectedElement = document.getElementById('rejectedOrders');
        if (rejectedElement) {
            rejectedElement.textContent = rejected;
        }
    } catch (error) {
        console.error('Error calculating statistics:', error);
    }
}

// Render orders to table
function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">Chưa có đơn hàng nào</td></tr>';
        return;
    }

    try {
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.orderCode || 'N/A'}</strong></td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${order.shippingPhone || 'N/A'}</td>
                <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" 
                    title="${order.shippingAddress || ''}">
                    ${order.shippingAddress || 'N/A'}
                </td>
                <td>${formatCurrency(order.totalAmount || 0)}</td>
                <td>${formatCurrency(order.discountAmount || 0)}</td>
                <td><strong style="color: var(--danger-color);">${formatCurrency(order.finalAmount || 0)}</strong></td>
                <td>
                    <span class="badge badge-${getOrderStatusBadgeClass(order.status)}">
                        ${getOrderStatusText(order.status)}
                    </span>
                </td>
                <td>${order.createdAt ? formatDate(order.createdAt) : 'N/A'}</td>
                <td class="table-actions">
                    <button class="btn btn-secondary btn-sm" onclick="viewOrderDetail(${order.id})" title="Xem chi tiết">
                        👁️ Chi tiết
                    </button>
                    
                    ${order.status === 'PENDING' ? `
                        <button class="btn btn-primary btn-sm" onclick="openApproveModal(${order.id})" title="Duyệt đơn" 
                                style="background: var(--success-color); border-color: var(--success-color);">
                            ✅ Duyệt
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="openRejectModal(${order.id})" title="Từ chối">
                            ❌ Từ chối
                        </button>
                    ` : ''}
                    
                    ${order.status === 'CONFIRMED' ? `
                        <button class="btn btn-primary btn-sm" onclick="updateToShipping(${order.id})" title="Chuyển sang Đang giao">
                            🚚 Đang giao
                        </button>
                    ` : ''}
                    
                    ${order.status === 'SHIPPING' ? `
                        <button class="btn btn-primary btn-sm" onclick="updateToDelivered(${order.id})" title="Đã giao hàng" 
                                style="background: var(--success-color); border-color: var(--success-color);">
                            ✅ Đã giao
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error rendering orders:', error);
        tbody.innerHTML = '<tr><td colspan="10" style="color: red;">Lỗi khi hiển thị dữ liệu</td></tr>';
    }
}

// Search orders
function searchOrders() {
    filterOrders();
}

// Filter orders
function filterOrders() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    
    let filtered = ordersData;
    
    if (keyword) {
        filtered = filtered.filter(order => 
            (order.orderCode && order.orderCode.toLowerCase().includes(keyword)) ||
            (order.customerName && order.customerName.toLowerCase().includes(keyword)) ||
            (order.shippingPhone && order.shippingPhone.includes(keyword))
        );
    }
    
    if (status) {
        filtered = filtered.filter(order => order.status === status);
    }
    
    renderOrders(filtered);
}

// View order detail
async function viewOrderDetail(id) {
    try {
        const order = await fetchGet(`${API_ENDPOINTS.ORDERS}/${id}`);

        const createdAtText = order.createdAt ? formatDate(order.createdAt) : 'N/A';
        const voucherInfo = order.couponCode
            ? `${order.couponCode}${order.couponName ? ` - ${order.couponName}` : ''}`
            : 'KhĂ´ng Ă¡p dá»¥ng';

        const safeVoucherInfo = order.couponCode
            ? `${order.couponCode}${order.couponName ? ` - ${order.couponName}` : ''}`
            : 'Khong ap dung';

        const content = document.getElementById('orderDetailContent');
        content.innerHTML = `
            <div class="grid grid-2" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <strong>Mã đơn hàng:</strong>
                    <p>${order.orderCode}</p>
                </div>
                <div class="form-group">
                    <strong>Trạng thái:</strong>
                    <p><span class="badge badge-${getOrderStatusBadgeClass(order.status)}">
                        ${getOrderStatusText(order.status)}
                    </span></p>
                </div>
            </div>
            
            <div class="form-group">
                <strong>Khách hàng:</strong>
                <p>${order.customerName}</p>
            </div>
            
            <div class="grid grid-2" style="gap: 1rem;">
                <div class="form-group">
                    <strong>Số điện thoại:</strong>
                    <p>${order.shippingPhone}</p>
                </div>
                <div class="form-group">
                    <strong>Ngày đặt:</strong>
                    <p>${createdAtText}</p>
                </div>
            </div>
            
            <div class="form-group">
                <strong>Địa chỉ giao hàng:</strong>
                <p>${order.shippingAddress}</p>
            </div>
            
            <div class="form-group">
                <strong>Ghi chú:</strong>
                <p>${order.note || '-'}</p>
            </div>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Chi tiết sản phẩm:</h3>
            ${order.orderItems && order.orderItems.length > 0 ? `
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${item.quantity}</td>
                                <td><strong>${formatCurrency(item.subtotal)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>Không có sản phẩm</p>'}
            
            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>Tổng tiền:</strong>
                    <span>${formatCurrency(order.totalAmount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>Giảm giá:</strong>
                    <span>-${formatCurrency(order.discountAmount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>Voucher:</strong>
                    <span>${safeVoucherInfo}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
                    <strong>Thành tiền:</strong>
                    <strong style="color: var(--danger-color);">${formatCurrency(order.finalAmount)}</strong>
                </div>
            </div>
        `;
        
        document.getElementById('orderDetailModal').classList.add('show');
    } catch (error) {
        console.error('Error loading order detail:', error);
        showNotification('Lỗi khi tải chi tiết đơn hàng', 'error');
    }
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModal').classList.remove('show');
}

// ===================================
// DUYỆT ĐƠN HÀNG
// ===================================

function openApproveModal(orderId) {
    currentOrderId = orderId;
    document.getElementById('approveOrderModal').classList.add('show');
}

function closeApproveOrderModal() {
    currentOrderId = null;
    document.getElementById('approveOrderModal').classList.remove('show');
}

async function confirmApproveOrder() {
    if (!currentOrderId) return;
    
    try {
        await fetchPut(`${API_ENDPOINTS.ORDERS}/${currentOrderId}/status?status=CONFIRMED`, {});
        showNotification('Duyệt đơn hàng thành công!', 'success');
        closeApproveOrderModal();
        await loadOrders();
    } catch (error) {
        console.error('Error approving order:', error);
        showNotification('Lỗi khi duyệt đơn hàng: ' + error.message, 'error');
    }
}

// ===================================
// TỪ CHỐI ĐƠN HÀNG
// ===================================

function openRejectModal(orderId) {
    currentOrderId = orderId;
    document.getElementById('rejectReason').value = '';
    document.getElementById('rejectOrderModal').classList.add('show');
}

function closeRejectOrderModal() {
    currentOrderId = null;
    document.getElementById('rejectOrderModal').classList.remove('show');
}

async function confirmRejectOrder(event) {
    event.preventDefault();
    
    if (!currentOrderId) return;
    
    const reason = document.getElementById('rejectReason').value;
    
    try {
        await fetchDelete(`${API_ENDPOINTS.ORDERS}/${currentOrderId}/cancel`);
        showNotification(`Đã từ chối đơn hàng. Lý do: ${reason}`, 'success');
        closeRejectOrderModal();
        await loadOrders();
    } catch (error) {
        console.error('Error rejecting order:', error);
        showNotification('Lỗi khi từ chối đơn hàng: ' + error.message, 'error');
    }
}

// ===================================
// CẬP NHẬT TRẠNG THÁI
// ===================================

async function updateToShipping(orderId) {
    if (!confirm('Xác nhận chuyển đơn hàng sang trạng thái "Đang giao"?')) {
        return;
    }
    
    try {
        await fetchPut(`${API_ENDPOINTS.ORDERS}/${orderId}/status?status=SHIPPING`, {});
        showNotification('Cập nhật trạng thái thành công!', 'success');
        await loadOrders();
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Lỗi khi cập nhật: ' + error.message, 'error');
    }
}

async function updateToDelivered(orderId) {
    if (!confirm('Xác nhận đơn hàng đã được giao thành công?')) {
        return;
    }
    
    try {
        await fetchPut(`${API_ENDPOINTS.ORDERS}/${orderId}/status?status=DELIVERED`, {});
        showNotification('Đơn hàng đã hoàn thành!', 'success');
        await loadOrders();
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Lỗi khi cập nhật: ' + error.message, 'error');
    }
}

// Helper functions
function getOrderStatusBadgeClass(status) {
    const classes = {
        'PENDING': 'warning',
        'CONFIRMED': 'info',
        'SHIPPING': 'info',
        'DELIVERED': 'success',
        'CANCELLED': 'secondary',
        'REJECTED': 'danger'
    };
    return classes[status] || 'secondary';
}

function getOrderStatusText(status) {
    const texts = {
        'PENDING': 'Chờ duyệt',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPING': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy',
        'REJECTED': 'Từ chối'
    };
    return texts[status] || status;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const detailModal = document.getElementById('orderDetailModal');
    const approveModal = document.getElementById('approveOrderModal');
    const rejectModal = document.getElementById('rejectOrderModal');
    
    if (event.target === detailModal) {
        closeOrderDetailModal();
    }
    if (event.target === approveModal) {
        closeApproveOrderModal();
    }
    if (event.target === rejectModal) {
        closeRejectOrderModal();
    }
}
