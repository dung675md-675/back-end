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
                        Chi tiết
                    </button>
                    
                    ${order.status === 'PENDING' ? `
                        <button class="btn btn-success btn-sm" onclick="openApproveModal(${order.id})" title="Duyệt đơn">
                            Duyệt
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="openRejectModal(${order.id})" title="Từ chối">
                            Từ chối
                        </button>
                    ` : ''}
                    
                    ${order.status === 'CONFIRMED' ? `
                        <button class="btn btn-primary btn-sm" onclick="updateToShipping(${order.id})" title="Chuyển sang Đang giao">
                            Đang giao
                        </button>
                    ` : ''}
                    
                    ${order.status === 'SHIPPING' ? `
                        <button class="btn btn-success btn-sm" onclick="updateToDelivered(${order.id})" title="Đã giao hàng">
                            Đã giao
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
        const safeVoucherInfo = order.couponCode
            ? `<span class="badge badge-info">${order.couponCode}</span>${order.couponName ? ` - ${order.couponName}` : ''}`
            : '<span class="text-muted">Không áp dụng</span>';

        const content = document.getElementById('orderDetailContent');
        content.innerHTML = `
            <div class="order-detail-wrapper">
                <!-- Header Info -->
                <div class="order-section">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Mã đơn hàng</span>
                            <span class="info-value" style="color: var(--vp-c-brand); font-size: 1.1rem;">#${order.orderCode}</span>
                        </div>
                        <div class="info-item" style="align-items: flex-end;">
                            <span class="info-label">Trạng thái</span>
                            <span class="badge badge-${getOrderStatusBadgeClass(order.status)}" style="padding: 0.5rem 1rem;">
                                ${getOrderStatusText(order.status)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Customer & Shipping -->
                <div class="order-section">
                    <h3 class="order-section-title"><i class='bx bx-user'></i> Thông tin khách hàng</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Họ và tên</span>
                            <span class="info-value">${order.customerName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Số điện thoại</span>
                            <span class="info-value">${order.shippingPhone}</span>
                        </div>
                        <div class="info-item" style="grid-column: span 2; margin-top: 0.5rem;">
                            <span class="info-label">Địa chỉ giao hàng</span>
                            <span class="info-value"><i class='bx bx-map-pin' style="color: var(--danger);"></i> ${order.shippingAddress}</span>
                        </div>
                        <div class="info-item" style="grid-column: span 2; margin-top: 0.5rem;">
                            <span class="info-label">Ngày đặt hàng</span>
                            <span class="info-value">${createdAtText}</span>
                        </div>
                    </div>
                </div>

                <!-- Note -->
                ${order.note ? `
                <div class="order-section">
                    <h3 class="order-section-title"><i class='bx bx-note'></i> Ghi chú</h3>
                    <div class="order-summary-box" style="margin-top: 0; background: #fffbeb; border: 1px solid #fef3c7;">
                        <p style="font-size: 0.9rem; color: #92400e;">${order.note}</p>
                    </div>
                </div>
                ` : ''}

                <!-- Product List -->
                <div class="order-section">
                    <h3 class="order-section-title"><i class='bx bx-package'></i> Danh sách sản phẩm</h3>
                    <div class="table-container shadow-none" style="border: 1px solid var(--border-color);">
                        <table class="order-items-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th style="text-align: right;">Đơn giá</th>
                                    <th style="text-align: center;">SL</th>
                                    <th style="text-align: right;">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.orderItems.map(item => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${item.productName}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">Mã SP: #${item.productId}</div>
                                        </td>
                                        <td style="text-align: right;">${formatCurrency(item.price)}</td>
                                        <td style="text-align: center;">${item.quantity}</td>
                                        <td style="text-align: right; font-weight: 600;">${formatCurrency(item.subtotal)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Payment Summary -->
                    <div class="order-summary-box">
                        <div class="summary-row">
                            <span>Tạm tính</span>
                            <span>${formatCurrency(order.totalAmount)}</span>
                        </div>
                        <div class="summary-row" style="color: var(--danger);">
                            <span>Giảm giá</span>
                            <span>-${formatCurrency(order.discountAmount)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Voucher applied</span>
                            <span>${safeVoucherInfo}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Tổng thanh toán</span>
                            <span>${formatCurrency(order.finalAmount)}</span>
                        </div>
                    </div>
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
