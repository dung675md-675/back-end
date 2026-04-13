const CUSTOMER_LEVEL_META = {
    BRONZE: { label: 'Đồng', color: '#8d5a2b', bg: '#fdf1e7' },
    SILVER: { label: 'Bạc', color: '#68707a', bg: '#f1f3f5' },
    GOLD: { label: 'Vàng', color: '#9c6b00', bg: '#fff6db' },
    PLATINUM: { label: 'Bạch Kim', color: '#0f5da8', bg: '#e9f5ff' },
    DIAMOND: { label: 'Kim Cương', color: '#6a1b9a', bg: '#f4e9fb' },
    VIP_A: { label: 'VIP A', color: '#00796b', bg: '#e0f2f1' },
    VIP_S: { label: 'VIP S', color: '#ef6c00', bg: '#fff3e0' },
    VIP_SS: { label: 'VIP SS', color: '#c62828', bg: '#ffebee' },
    VIP_SSS: { label: 'VIP SSS', color: '#283593', bg: '#e8eaf6' }
};

const DISCOUNT_TYPE_LABELS = {
    PERCENT: 'Phần trăm',
    FIXED_AMOUNT: 'Số tiền cố định'
};

const CUSTOMER_LEVELS = Object.keys(CUSTOMER_LEVEL_META);
let customersData = [];

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    requestAnimationFrame(() => notification.classList.add('show'));
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 250);
    }, 3000);
}

function injectEnhancedCustomerStyles() {
    if (document.getElementById('enhancedCustomerStyles')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCustomerStyles';
    style.textContent = `
        .voucher-panel {
            background: #fff;
            border: 1px solid #ececec;
            border-radius: 18px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
        }
        .voucher-panel h3 {
            margin: 0 0 8px;
            font-size: 20px;
            color: #12263a;
        }
        .voucher-panel p {
            margin: 0 0 18px;
            color: #64748b;
            font-size: 14px;
            line-height: 1.5;
        }
        .voucher-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
        }
        .voucher-grid .full {
            grid-column: 1 / -1;
        }
        .voucher-panel label {
            display: block;
            font-weight: 600;
            margin-bottom: 6px;
            color: #1f2937;
        }
        .voucher-panel input,
        .voucher-panel select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d7dee7;
            border-radius: 10px;
            font-size: 14px;
            box-sizing: border-box;
        }
        .voucher-panel input:focus,
        .voucher-panel select:focus {
            outline: none;
            border-color: #6c3fc5;
            box-shadow: 0 0 0 3px rgba(108, 63, 197, 0.12);
        }
        .voucher-actions {
            display: flex;
            gap: 12px;
            margin-top: 18px;
            flex-wrap: wrap;
        }
        .checkbox-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
        }
        .level-option,
        .coupon-option {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            background: #fafafa;
            display: flex;
            gap: 10px;
            align-items: flex-start;
        }
        .level-option input,
        .coupon-option input {
            width: auto;
            margin-top: 2px;
        }
        .level-option strong,
        .coupon-option strong {
            display: block;
            margin-bottom: 4px;
        }
        .level-option small,
        .coupon-option small {
            color: #6b7280;
            display: block;
            line-height: 1.4;
        }
        .level-badge,
        .coupon-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            margin-right: 6px;
            margin-bottom: 6px;
        }
        .coupon-badge {
            background: #eef2ff;
            color: #4338ca;
        }
        .empty-badge {
            color: #64748b;
            font-size: 12px;
        }
        .assign-btn {
            display: none !important;
        }
        .table-actions {
            display: flex;
            gap: 8px;
            flex-wrap: nowrap;
            white-space: nowrap;
        }
        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .assign-modal-box {
            width: min(760px, calc(100vw - 32px));
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            background: #fff;
            border-radius: 18px;
            padding: 22px;
            box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22);
        }
        .assign-modal-box h3 {
            margin: 0 0 8px;
        }
        .assign-modal-box p {
            margin: 0 0 16px;
            color: #64748b;
        }
        .assign-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 18px;
        }
        .inline-hint {
            font-size: 12px;
            color: #6b7280;
            margin-top: 6px;
        }
        @media (max-width: 900px) {
            .voucher-grid,
            .checkbox-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

function renderLevelBadge(rank) {
    const meta = CUSTOMER_LEVEL_META[rank] || { label: rank, color: '#475569', bg: '#e2e8f0' };
    return `<span class="level-badge" style="background:${meta.bg};color:${meta.color};">${meta.label}</span>`;
}

function renderAssignedCoupons(customer) {
    if (!customer.assignedCoupons || customer.assignedCoupons.length === 0) {
        return '<span class="empty-badge">Chưa có voucher nào</span>';
    }

    return customer.assignedCoupons
        .map(code => `<span class="coupon-badge">${code}</span>`)
        .join('');
}

function injectVoucherManagementPanel() {
    if (document.getElementById('customerVoucherControls')) return;

    const stats = document.querySelector('.stats-container');
    if (!stats) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'customerVoucherControls';
    wrapper.className = 'voucher-panel';
    wrapper.innerHTML = `
        <h3>Tạo voucher mới và áp dụng theo hạng khách hàng</h3>
        <p>
            Khi tạo voucher, bạn có thể chọn nhiều hạng khách hàng cùng lúc.
            Hệ thống sẽ tự động gắn voucher này cho toàn bộ khách hàng thuộc các hạng được chọn.
        </p>
        <div class="voucher-grid">
            <div>
                <label for="adminCouponName">Tên voucher</label>
                <input id="adminCouponName" type="text" placeholder="Ví dụ: Ưu đãi khách hàng VIP tháng 4">
            </div>
            <div>
                <label for="adminCouponCode">Mã voucher</label>
                <input id="adminCouponCode" type="text" placeholder="Ví dụ: VIPAPRIL25">
            </div>
            <div>
                <label for="adminDiscountType">Kiểu giảm giá</label>
                <select id="adminDiscountType" onchange="toggleDiscountInputLabel()">
                    <option value="PERCENT">Phần trăm</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định</option>
                </select>
            </div>
            <div>
                <label id="adminDiscountValueLabel" for="adminDiscountValue">Phần trăm giảm giá</label>
                <input id="adminDiscountValue" type="number" min="1" placeholder="Ví dụ: 10">
                <div class="inline-hint" id="adminDiscountValueHint">Nhập phần trăm giảm giá cho voucher.</div>
            </div>
            <div>
                <label for="adminCouponStartDate">Ngày bắt đầu</label>
                <input id="adminCouponStartDate" type="datetime-local">
            </div>
            <div>
                <label for="adminCouponEndDate">Ngày kết thúc</label>
                <input id="adminCouponEndDate" type="datetime-local">
            </div>
            <div>
                <label for="adminMinOrderValue">Giá trị đơn hàng tối thiểu(VND)</label>
                <input id="adminMinOrderValue" type="number" min="0" step="1000" placeholder="Ví dụ: 500000">
            </div>
            <div>
                <label for="adminCouponQuantity">Số lượng voucher</label>
                <input id="adminCouponQuantity" type="number" min="1" step="1" placeholder="Ví dụ: 300">
            </div>
            <div class="full">
                <label>Áp dụng cho level</label>
                <div class="checkbox-grid">
                    <label class="level-option">
                        <input type="checkbox" name="targetLevels" value="ALL" onchange="handleAllLevelToggle(this)">
                        <span>
                            <strong>Tất cả</strong>
                            <small>Áp dụng cho toàn bộ khách hàng.</small>
                        </span>
                    </label>
                    ${CUSTOMER_LEVELS.map(level => `
                        <label class="level-option">
                            <input type="checkbox" name="targetLevels" value="${level}" onchange="handleSingleLevelToggle()">
                            <span>
                                <strong>${CUSTOMER_LEVEL_META[level].label}</strong>
                                <small>Tự động gắn voucher cho toàn bộ khách hàng thuộc hạng này.</small>
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="voucher-actions">
            <button class="btn btn-primary" onclick="createAdminCustomerCoupon()">Tạo voucher</button>
        </div>
    `;

    stats.insertAdjacentElement('afterend', wrapper);
    toggleDiscountInputLabel();
}

function toggleDiscountInputLabel() {
    const type = document.getElementById('adminDiscountType')?.value || 'PERCENT';
    const label = document.getElementById('adminDiscountValueLabel');
    const hint = document.getElementById('adminDiscountValueHint');
    const input = document.getElementById('adminDiscountValue');
    if (!label || !hint || !input) return;

    if (type === 'FIXED_AMOUNT') {
        label.textContent = 'Số tiền giảm';
        hint.textContent = 'Nhập số tiền giảm trực tiếp, đơn vị VNĐ.';
        input.placeholder = 'Ví dụ: 100000';
    } else {
        label.textContent = 'Phần trăm giảm giá';
        hint.textContent = 'Nhập phần trăm giảm giá cho voucher.';
        input.placeholder = 'Ví dụ: 10';
    }
}

function handleAllLevelToggle(allCheckbox) {
    const levelCheckboxes = Array.from(document.querySelectorAll('input[name="targetLevels"]:not([value="ALL"])'));
    if (!allCheckbox) return;

    if (allCheckbox.checked) {
        levelCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            checkbox.disabled = true;
        });
        return;
    }

    levelCheckboxes.forEach(checkbox => {
        checkbox.disabled = false;
    });
}

function handleSingleLevelToggle() {
    const allCheckbox = document.querySelector('input[name="targetLevels"][value="ALL"]');
    if (!allCheckbox) return;

    const levelCheckboxes = Array.from(document.querySelectorAll('input[name="targetLevels"]:not([value="ALL"])'));
    if (allCheckbox.checked) {
        const allChecked = levelCheckboxes.every(checkbox => checkbox.checked);
        if (!allChecked) {
            allCheckbox.checked = false;
            levelCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
        }
    }
}

async function createAdminCustomerCoupon() {
    const name = document.getElementById('adminCouponName')?.value.trim();
    const code = document.getElementById('adminCouponCode')?.value.trim().toUpperCase();
    const discountType = document.getElementById('adminDiscountType')?.value || 'PERCENT';
    const discountValue = parseFloat(document.getElementById('adminDiscountValue')?.value || '0');
    const startDate = document.getElementById('adminCouponStartDate')?.value;
    const endDate = document.getElementById('adminCouponEndDate')?.value;
    const minOrderValue = parseFloat(document.getElementById('adminMinOrderValue')?.value || '0');
    const totalQuantity = Number.parseInt(document.getElementById('adminCouponQuantity')?.value || '0', 10);
    const selectedLevels = Array.from(document.querySelectorAll('input[name="targetLevels"]:checked'))
        .map(input => input.value);
    const targetLevels = selectedLevels.includes('ALL') ? ['ALL'] : selectedLevels;

    if (!name || !code) {
        showNotification('Vui lòng nhập đầy đủ tên voucher và mã voucher.', 'warning');
        return;
    }
    if (!discountValue || discountValue <= 0) {
        showNotification('Vui lòng nhập mức giảm hợp lệ.', 'warning');
        return;
    }
    if (!startDate || !endDate) {
        showNotification('Vui lòng chọn ngày bắt đầu và ngày kết thúc.', 'warning');
        return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
        showNotification('Ngày kết thúc phải lớn hơn ngày bắt đầu.', 'warning');
        return;
    }
    if (targetLevels.length === 0) {
        showNotification('Vui lòng chọn ít nhất một level để áp dụng.', 'warning');
        return;
    }
    if (!Number.isInteger(totalQuantity) || totalQuantity <= 0) {
        showNotification('Vui lòng nhập số lượng voucher hợp lệ (lớn hơn 0).', 'warning');
        return;
    }

    const payload = {
        name,
        code,
        discountType,
        discountPercent: discountType === 'PERCENT' ? Math.round(discountValue) : 0,
        fixedDiscountAmount: discountType === 'FIXED_AMOUNT' ? discountValue : 0,
        maxDiscountAmount: discountType === 'PERCENT' ? 0 : discountValue,
        minOrderValue,
        minOrderAmount: minOrderValue,
        startDate: `${startDate}:00`,
        endDate: `${endDate}:00`,
        targetLevels,
        totalQuantity
    };

    try {
        await fetchPost(`${API_BASE_URL}/coupons`, payload);
        document.getElementById('adminCouponName').value = '';
        document.getElementById('adminCouponCode').value = '';
        document.getElementById('adminDiscountValue').value = '';
        document.getElementById('adminCouponStartDate').value = '';
        document.getElementById('adminCouponEndDate').value = '';
        document.getElementById('adminMinOrderValue').value = '';
        document.getElementById('adminCouponQuantity').value = '';
        document.querySelectorAll('input[name="targetLevels"]').forEach(input => {
            input.checked = false;
            input.disabled = false;
        });
        await loadCustomers();
        showNotification('Đã tạo voucher và gắn tự động theo level thành công.', 'success');
    } catch (error) {
        showNotification(error.message || 'Không thể tạo voucher mới.', 'error');
    }
}

async function loadCustomers() {
    try {
        customersData = await fetchGet(API_ENDPOINTS.CUSTOMERS);
        customersData = [...customersData].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
        renderCustomers(customersData);
        calculateStatistics();
    } catch (error) {
        document.getElementById('customersTableBody').innerHTML =
            '<tr><td colspan="10">Không thể tải dữ liệu khách hàng.</td></tr>';
    }
}

function calculateStatistics() {
    const totalCustomers = customersData.length;
    const totalOrders = customersData.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0);
    const totalSpent = customersData.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);
    const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('avgSpent').textContent = formatCurrency(avgSpent);
}

function renderCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!customers || customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">Chưa có khách hàng nào.</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.id}</td>
            <td><strong>${customer.fullName}</strong></td>
            <td>${customer.email}</td>
            <td>${customer.phone || '-'}</td>
            <td>${renderLevelBadge(customer.rank)}</td>
            <td>${getFullAddress(customer)}</td>
            <td><span class="badge badge-info">${customer.totalOrders || 0}</span></td>
            <td><strong style="color: var(--danger-color);">${formatCurrency(customer.totalSpent || 0)}</strong></td>
            <td>${renderAssignedCoupons(customer)}</td>
            <td class="table-actions">
                <button class="btn btn-primary btn-sm" onclick="editCustomer(${customer.id})">Sửa</button>
            </td>
        </tr>
    `).join('');
}

function searchCustomers() {
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = customersData.filter(customer =>
        customer.fullName.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword) ||
        (customer.phone && customer.phone.toLowerCase().includes(keyword)) ||
        (CUSTOMER_LEVEL_META[customer.rank]?.label || customer.rank).toLowerCase().includes(keyword)
    );
    renderCustomers(filtered);
}

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
        showNotification('Không thể tải thông tin khách hàng.', 'error');
    }
}

function closeCustomerEditModal() {
    document.getElementById('customerEditModal').classList.remove('show');
}

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
        closeCustomerEditModal();
        await loadCustomers();
        showNotification('Cập nhật thông tin khách hàng thành công.', 'success');
    } catch (error) {
        showNotification('Không thể cập nhật thông tin khách hàng.', 'error');
    }
}

function getFullAddress(customer) {
    const parts = [customer.address, customer.ward, customer.district, customer.city].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
}

window.onclick = function(event) {
    const editModal = document.getElementById('customerEditModal');
    if (event.target === editModal) {
        closeCustomerEditModal();
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    injectEnhancedCustomerStyles();
    injectVoucherManagementPanel();
    await loadCustomers();
});
