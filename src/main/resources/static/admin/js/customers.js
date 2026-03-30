// ===================================
// CUSTOMERS PAGE LOGIC
// ===================================

let customersData = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadCustomers();
});

// Load all customers
async function loadCustomers() {
    try {
        customersData = await fetchGet(API_ENDPOINTS.CUSTOMERS);
        renderCustomers(customersData);
        calculateStatistics();
    } catch (error) {
        document.getElementById('customersTableBody').innerHTML = 
            '<tr><td colspan="8">Lỗi khi tải dữ liệu</td></tr>';
    }
}

// Calculate statistics
function calculateStatistics() {
    const totalCustomers = customersData.length;
    const totalOrders = customersData.reduce((sum, c) => sum + c.totalOrders, 0);
    const totalSpent = customersData.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
    
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('avgSpent').textContent = formatCurrency(avgSpent);
}

// Render customers to table
function renderCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Chưa có khách hàng nào</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.id}</td>
            <td><strong>${customer.fullName}</strong></td>
            <td>${customer.email}</td>
            <td>${customer.phone || '-'}</td>
            <td>${getFullAddress(customer)}</td>
            <td><span class="badge badge-info">${customer.totalOrders}</span></td>
            <td><strong style="color: var(--danger-color);">${formatCurrency(customer.totalSpent)}</strong></td>
            <td class="table-actions">
                <button class="btn btn-primary btn-sm" onclick="editCustomer(${customer.id})">
                    ✏️ Sửa
                </button>
            </td>
        </tr>
    `).join('');
}

// Search customers
function searchCustomers() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const filtered = customersData.filter(customer => 
        customer.fullName.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword) ||
        (customer.phone && customer.phone.includes(keyword))
    );
    renderCustomers(filtered);
}

// // View customer detail
// async function viewCustomerDetail(id) {
//     try {
//         const customer = await fetchGet(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
//         const orders = await fetchGet(API_ENDPOINTS.ORDERS_BY_CUSTOMER(id));
        
//         const content = document.getElementById('customerDetailContent');
//         content.innerHTML = `
//             <div class="grid grid-2" style="gap: 1rem;">
//                 <div class="form-group">
//                     <strong>Họ tên:</strong> ${customer.fullName}
//                 </div>
//                 <div class="form-group">
//                     <strong>Username:</strong> ${customer.username}
//                 </div>
//                 <div class="form-group">
//                     <strong>Email:</strong> ${customer.email}
//                 </div>
//                 <div class="form-group">
//                     <strong>Số điện thoại:</strong> ${customer.phone || '-'}
//                 </div>
//             </div>
            
//             <div class="form-group">
//                 <strong>Địa chỉ:</strong> ${getFullAddress(customer)}
//             </div>
            
//             <div class="grid grid-2" style="gap: 1rem; margin-top: 1rem;">
//                 <div class="form-group">
//                     <strong>Tổng đơn hàng:</strong> 
//                     <span class="badge badge-info">${customer.totalOrders}</span>
//                 </div>
//                 <div class="form-group">
//                     <strong>Tổng chi tiêu:</strong> 
//                     <strong style="color: var(--danger-color);">${formatCurrency(customer.totalSpent)}</strong>
//                 </div>
//             </div>
            
//             <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Lịch sử đơn hàng:</h3>
//             ${orders.length > 0 ? `
//                 <table style="width: 100%;">
//                     <thead>
//                         <tr>
//                             <th>Mã đơn</th>
//                             <th>Ngày đặt</th>
//                             <th>Tổng tiền</th>
//                             <th>Trạng thái</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${orders.map(order => `
//                             <tr>
//                                 <td><strong>${order.orderCode}</strong></td>
//                                 <td>${formatDate(order.createdAt)}</td>
//                                 <td><strong>${formatCurrency(order.finalAmount)}</strong></td>
//                                 <td>
//                                     <span class="badge badge-${getOrderStatusBadgeClass(order.status)}">
//                                         ${getOrderStatusText(order.status)}
//                                     </span>
//                                 </td>
//                             </tr>
//                         `).join('')}
//                     </tbody>
//                 </table>
//             ` : '<p>Chưa có đơn hàng nào</p>'}
//         `;
        
//         document.getElementById('customerDetailModal').classList.add('show');
//     } catch (error) {
//         console.error('Error loading customer detail:', error);
//     }
// }

// Close customer detail modal
function closeCustomerDetailModal() {
    document.getElementById('customerDetailModal').classList.remove('show');
}

// Edit customer
async function editCustomer(id) {
    try {
        const customer = await fetchGet(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
        
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerCity').value = customer.city || '';
        document.getElementById('customerDistrict').value = customer.district || '';
        document.getElementById('customerWard').value = customer.ward || '';
        
        document.getElementById('customerEditModal').classList.add('show');
    } catch (error) {
        console.error('Error loading customer:', error);
    }
}

// Close customer edit modal
function closeCustomerEditModal() {
    document.getElementById('customerEditModal').classList.remove('show');
}

// Submit customer form
async function submitCustomer(event) {
    event.preventDefault();
    
    const id = document.getElementById('customerId').value;
    const data = {
        address: document.getElementById('customerAddress').value,
        city: document.getElementById('customerCity').value,
        district: document.getElementById('customerDistrict').value,
        ward: document.getElementById('customerWard').value
    };

    try {
        await fetchPut(`${API_ENDPOINTS.CUSTOMERS}/${id}`, data);
        showNotification('Cập nhật thông tin khách hàng thành công!', 'success');
        closeCustomerEditModal();
        await loadCustomers();
    } catch (error) {
        console.error('Error updating customer:', error);
    }
}

// Helper functions
function getFullAddress(customer) {
    const parts = [
        customer.address,
        customer.ward,
        customer.district,
        customer.city
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '-';
}

function getOrderStatusBadgeClass(status) {
    const classes = {
        'PENDING': 'warning',
        'CONFIRMED': 'info',
        'SHIPPING': 'info',
        'DELIVERED': 'success',
        'CANCELLED': 'danger'
    };
    return classes[status] || 'secondary';
}

function getOrderStatusText(status) {
    const texts = {
        'PENDING': 'Chờ xử lý',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPING': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy'
    };
    return texts[status] || status;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const detailModal = document.getElementById('customerDetailModal');
    const editModal = document.getElementById('customerEditModal');
    
    if (event.target === detailModal) {
        closeCustomerDetailModal();
    }
    if (event.target === editModal) {
        closeCustomerEditModal();
    }
}