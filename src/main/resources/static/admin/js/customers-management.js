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

const CUSTOMER_LEVELS = Object.keys(CUSTOMER_LEVEL_META);

let customersData = [];
let couponsData = [];
let pendingCouponPayload = null;

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
    if (document.getElementById('enhancedCustomerStylesV2')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCustomerStylesV2';
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
        .level-option {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            background: #fafafa;
            display: flex;
            gap: 10px;
            align-items: flex-start;
        }
        .level-option input {
            width: auto;
            margin-top: 2px;
        }
        .level-option strong {
            display: block;
            margin-bottom: 4px;
        }
        .level-option small {
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
        .table-actions {
            display: flex;
            gap: 8px;
            flex-wrap: nowrap;
            white-space: nowrap;
        }
        .voucher-list-section {
            margin-top: 22px;
            border-top: 1px solid #ececec;
            padding-top: 18px;
        }
        .voucher-list-section h4 {
            margin: 0 0 12px;
            font-size: 16px;
            color: #1f2937;
        }
        .voucher-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .voucher-table th,
        .voucher-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #f0f0f0;
            text-align: left;
            vertical-align: top;
        }
        .voucher-table th {
            background: #f8fafc;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: #64748b;
            white-space: nowrap;
        }
        .voucher-code {
            font-family: monospace;
            font-weight: 700;
            color: #4338ca;
            background: #eef2ff;
            border-radius: 6px;
            padding: 2px 8px;
            display: inline-block;
        }
        .voucher-confirm-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 2000;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        .voucher-confirm-modal.show {
            display: flex;
        }
        .voucher-confirm-box {
            width: min(680px, 100%);
            max-height: 90vh;
            overflow: auto;
            background: #fff;
            border-radius: 14px;
            padding: 18px;
        }
        .voucher-confirm-box h3 {
            margin: 0 0 10px;
            color: #111827;
        }
        .voucher-summary-grid {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 8px 10px;
            font-size: 14px;
            margin-top: 10px;
        }
        .voucher-summary-grid .k {
            color: #6b7280;
        }
        .voucher-summary-grid .v {
            color: #111827;
            font-weight: 600;
        }
        .confirm-actions {
            margin-top: 16px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            flex-wrap: wrap;
        }
        @media (max-width: 900px) {
            .voucher-grid,
            .checkbox-grid {
                grid-template-columns: 1fr;
            }
            .voucher-summary-grid {
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
    return customer.assignedCoupons.map(code => `<span class="coupon-badge">${code}</span>`).join('');
}

function injectVoucherManagementPanel() {
    if (document.getElementById('customerVoucherControls')) return;

    const stats = document.querySelector('.stats-container');
    if (!stats) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'customerVoucherControls';
    wrapper.className = 'voucher-panel';
    wrapper.innerHTML = `
        <h3>Tạo voucher mới và áp dụng theo level khách hàng</h3>
        <p>
            Voucher sẽ được gắn tự động theo level đã chọn.
        </p>
        <div class="voucher-grid">
            <div>
                <label for="adminCouponName">Tên voucher</label>
                <input id="adminCouponName" type="text" placeholder="Ví dụ: Ưu đãi VIP tháng 4">
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
                <label for="adminMinOrderValue">Giá trị đơn hàng tối thiểu (VNĐ)</label>
                <input id="adminMinOrderValue" type="number" min="0" step="1000" placeholder="Ví dụ: 500000">
            </div>
            <div>
                <label for="adminCouponQuantity">Số lượnng voucher</label>
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
                                <small>Tự động gắn voucher cho khách hàng thuộc level này.</small>
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="voucher-actions">
            <button class="btn btn-primary" onclick="openVoucherConfirmModal()">Tiếp tục</button>
        </div>
        <div class="voucher-list-section">
            <h4>Danh sách voucher hiện có</h4>
            <div class="table-container">
                <table class="voucher-table">
                    <thead>
                        <tr>
                            <th>Tên voucher</th>
                            <th>Mã</th>
                            <th>Mức giảm</th>
                            <th>Đơn tối thiểu</th>
                            <th>Số lượng</th>
                            <th>Còn lại</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Áp dụng cho level</th>
                        </tr>
                    </thead>
                    <tbody id="adminCouponTableBody">
                        <tr><td colspan="9">Đang tải danh sách voucher...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    stats.insertAdjacentElement('afterend', wrapper);
    toggleDiscountInputLabel();
}

function injectVoucherConfirmModal() {
    if (document.getElementById('voucherConfirmModal')) return;

    const modal = document.createElement('div');
    modal.id = 'voucherConfirmModal';
    modal.className = 'voucher-confirm-modal';
    modal.innerHTML = `
        <div class="voucher-confirm-box">
            <h3>Xác nhận thông tin voucher</h3>
            <p style="margin:0;color:#6b7280;">Kiểm tra lại thông tin trước khi lưu vì voucher sẽ tự động gắn theo level.</p>
            <div id="voucherConfirmSummary" class="voucher-summary-grid"></div>
            <div class="confirm-actions">
                <button class="btn btn-secondary" type="button" onclick="closeVoucherConfirmModal()">Quay lại chỉnh sửa</button>
                <button id="confirmSaveVoucherBtn" class="btn btn-primary" type="button" onclick="confirmCreateAdminCustomerCoupon()">Xác nhận & Lưu</button>
            </div>
        </div>
    `;

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeVoucherConfirmModal();
        }
    });

    document.body.appendChild(modal);
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
    if (!allCheckbox.checked) return;

    const allChecked = levelCheckboxes.every(checkbox => checkbox.checked);
    if (!allChecked) {
        allCheckbox.checked = false;
        levelCheckboxes.forEach(checkbox => {
            checkbox.disabled = false;
        });
    }
}

function formatDateCell(dateString) {
    if (!dateString) return '-';
    try {
        return formatDate(dateString);
    } catch (error) {
        return dateString;
    }
}

function resolveTargetLevelLabel(levels) {
    if (!Array.isArray(levels) || levels.length === 0) return '-';
    if (levels.includes('ALL')) return 'Tất cả';
    return levels
        .map(level => CUSTOMER_LEVEL_META[level]?.label || level)
        .join(', ');
}

function resolveDiscountLabel(coupon) {
    if (coupon.discountLabel) return coupon.discountLabel;
    if (coupon.discountType === 'FIXED_AMOUNT') {
        return `Giảm ${formatCurrency(coupon.fixedDiscountAmount || 0)}`;
    }
    return `Giảm ${coupon.discountPercent || 0}%`;
}

function collectCouponFormData() {
    const name = document.getElementById('adminCouponName')?.value.trim();
    const code = document.getElementById('adminCouponCode')?.value.trim().toUpperCase();
    const discountType = document.getElementById('adminDiscountType')?.value || 'PERCENT';
    const discountValue = parseFloat(document.getElementById('adminDiscountValue')?.value || '0');
    const startDate = document.getElementById('adminCouponStartDate')?.value;
    const endDate = document.getElementById('adminCouponEndDate')?.value;
    const minOrderValue = parseFloat(document.getElementById('adminMinOrderValue')?.value || '0');
    const totalQuantity = Number.parseInt(document.getElementById('adminCouponQuantity')?.value || '0', 10);
    const selectedLevels = Array.from(document.querySelectorAll('input[name="targetLevels"]:checked')).map(input => input.value);
    const targetLevels = selectedLevels.includes('ALL') ? ['ALL'] : selectedLevels;

    if (!name || !code) {
        showNotification('Vui lòng nhập đầy đủ tên voucher và mã voucher.', 'warning');
        return null;
    }
    if (!discountValue || discountValue <= 0) {
        showNotification('Vui lòng nhập mức giảm hợp lệ.', 'warning');
        return null;
    }
    if (!startDate || !endDate) {
        showNotification('Vui lòng chọn ngày bắt đầu và ngày kết thúc.', 'warning');
        return null;
    }
    if (new Date(startDate) >= new Date(endDate)) {
        showNotification('Ngày kết thúc phải lớn hơn ngày bắt đầu.', 'warning');
        return null;
    }
    if (targetLevels.length === 0) {
        showNotification('Vui lòng chọn ít nhất một level để áp dụng.', 'warning');
        return null;
    }

    if (!Number.isInteger(totalQuantity) || totalQuantity <= 0) {
        showNotification('Vui long nhap so luong voucher hop le (lon hon 0).', 'warning');
        return null;
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

    return {
        payload,
        summary: {
            name,
            code,
            discount: discountType === 'PERCENT'
                ? `${Math.round(discountValue)}%`
                : formatCurrency(discountValue),
            minOrder: minOrderValue > 0 ? formatCurrency(minOrderValue) : 'Không yêu cầu',
            startDate: formatDateCell(payload.startDate),
            endDate: formatDateCell(payload.endDate),
            levels: resolveTargetLevelLabel(targetLevels),
            totalQuantity
        }
    };
}

function openVoucherConfirmModal() {
    const prepared = collectCouponFormData();
    if (!prepared) return;

    pendingCouponPayload = prepared.payload;
    const summary = prepared.summary;
    const summaryEl = document.getElementById('voucherConfirmSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="k">Tên voucher</div><div class="v">${summary.name}</div>
            <div class="k">Mã voucher</div><div class="v">${summary.code}</div>
            <div class="k">Mức giảm</div><div class="v">${summary.discount}</div>
            <div class="k">Đơn tối thiểu</div><div class="v">${summary.minOrder}</div>
            <div class="k">Ngày bắt đầu</div><div class="v">${summary.startDate}</div>
            <div class="k">Ngày kết thúc</div><div class="v">${summary.endDate}</div>
            <div class="k">Áp dụng cho level</div><div class="v">${summary.levels}</div>
            <div class="k">So luong voucher</div><div class="v">${summary.totalQuantity}</div>
        `;
    }

    document.getElementById('voucherConfirmModal')?.classList.add('show');
}

function closeVoucherConfirmModal() {
    document.getElementById('voucherConfirmModal')?.classList.remove('show');
}

async function confirmCreateAdminCustomerCoupon() {
    if (!pendingCouponPayload) {
        closeVoucherConfirmModal();
        return;
    }

    const saveBtn = document.getElementById('confirmSaveVoucherBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Đang lưu...';
    }

    try {
        await fetchPost(`${API_BASE_URL}/coupons`, pendingCouponPayload);
        resetVoucherForm();
        closeVoucherConfirmModal();
        pendingCouponPayload = null;
        await Promise.all([loadCustomers(), loadCoupons()]);
        showNotification('Đã tạo voucher và gắn tự động theo level thành công.', 'success');
    } catch (error) {
        showNotification(error.message || 'Không thể tạo voucher mới.', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Xác nhận & Lưu';
        }
    }
}

function resetVoucherForm() {
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
}

async function loadCoupons() {
    const tbody = document.getElementById('adminCouponTableBody');
    if (!tbody) return;

    try {
        couponsData = await fetchGet(`${API_BASE_URL}/coupons`);
        renderCouponTable(couponsData);
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="9">Không thể tải danh sách voucher.</td></tr>';
    }
}

function renderCouponTable(coupons) {
    const tbody = document.getElementById('adminCouponTableBody');
    if (!tbody) return;

    if (!Array.isArray(coupons) || coupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">Chưa có voucher nào.</td></tr>';
        return;
    }

    tbody.innerHTML = coupons.map(coupon => `
        <tr>
            <td>${coupon.name || '-'}</td>
            <td><span class="voucher-code">${coupon.code || '-'}</span></td>
            <td>${resolveDiscountLabel(coupon)}</td>
            <td>${(coupon.minOrderValue || coupon.minOrderAmount) ? formatCurrency(coupon.minOrderValue || coupon.minOrderAmount) : '-'}</td>
            <td>${coupon.totalQuantity ?? '-'}</td>
            <td>${coupon.remainingQuantity ?? '-'}</td>
            <td>${formatDateCell(coupon.startDate)}</td>
            <td>${formatDateCell(coupon.endDate || coupon.expiryDate)}</td>
            <td>${resolveTargetLevelLabel(coupon.targetLevels)}</td>
        </tr>
    `).join('');
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
    const confirmModal = document.getElementById('voucherConfirmModal');
    if (event.target === editModal) {
        closeCustomerEditModal();
    }
    if (event.target === confirmModal) {
        closeVoucherConfirmModal();
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    injectEnhancedCustomerStyles();
    injectVoucherManagementPanel();
    injectVoucherConfirmModal();
    await Promise.all([loadCustomers(), loadCoupons()]);
});

