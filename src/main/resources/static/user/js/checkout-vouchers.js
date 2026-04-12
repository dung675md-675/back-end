let availableCustomerCoupons = [];

function getCheckoutItems() {
    if (typeof currentItems !== 'undefined' && Array.isArray(currentItems)) {
        return currentItems;
    }
    if (Array.isArray(window.currentItems)) {
        return window.currentItems;
    }
    return [];
}

function setCurrentSubtotalValue(value) {
    if (typeof currentSubtotal !== 'undefined') {
        currentSubtotal = value;
    }
    window.currentSubtotal = value;
}

function setAppliedVoucherValue(voucher) {
    if (typeof appliedVoucher !== 'undefined') {
        appliedVoucher = voucher;
    }
    window.appliedVoucher = voucher;
}

function getCurrentCheckoutSubtotal() {
    const items = getCheckoutItems();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCouponMinOrderValue(coupon) {
    if (!coupon) return 0;
    return coupon.minOrderValue ?? coupon.minOrderAmount ?? 0;
}

function formatMinOrderValue(value) {
    return `${new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(value || 0)))}đ`;
}

function setVoucherCodeDisplay(code) {
    const voucherCodeDisplay = document.getElementById('voucherCodeDisplay');
    if (voucherCodeDisplay) {
        voucherCodeDisplay.textContent = code ? `(${code})` : '';
    }
}

function ensureVoucherDropdownUI() {
    const box = document.querySelector('.voucher-box');
    if (!box) return;

    box.innerHTML = `
        <div class="voucher-label">🎟️ Voucher của bạn</div>
        <div class="form-group" style="margin-bottom: 0;">
            <select id="voucherSelect" class="voucher-input" style="text-transform:none;">
                <option value="">Chọn voucher để áp dụng</option>
            </select>
        </div>
        <div id="voucherResult" class="voucher-result" style="display:block;"></div>
    `;

    const select = document.getElementById('voucherSelect');
    if (select) {
        select.addEventListener('change', applySelectedVoucher);
    }
}

async function loadAssignedVouchers() {
    const resultEl = document.getElementById('voucherResult');
    const select = document.getElementById('voucherSelect');
    if (!resultEl || !select) return;

    try {
        availableCustomerCoupons = await fetchGet(API_ENDPOINTS.COUPONS_ME);
        select.innerHTML = '<option value="">Chọn voucher để áp dụng</option>';

        if (!availableCustomerCoupons.length) {
            select.disabled = true;
            resultEl.className = 'voucher-result';
            resultEl.textContent = 'Hiện tại tài khoản của bạn chưa có voucher khả dụng.';
            return;
        }

        select.disabled = false;
        availableCustomerCoupons.forEach(coupon => {
            const option = document.createElement('option');
            option.value = coupon.id;

            const minOrderValue = getCouponMinOrderValue(coupon);
            const minOrderLabel = minOrderValue > 0
                ? `Đơn tối thiểu ${formatMinOrderValue(minOrderValue)}`
                : 'Không yêu cầu đơn tối thiểu';

            option.textContent = `${coupon.name || coupon.code} | ${coupon.code} | ${coupon.discountLabel || buildVoucherDiscountLabel(coupon)} | ${minOrderLabel}`;
            select.appendChild(option);
        });

        resultEl.className = 'voucher-result';
        resultEl.textContent = 'Chọn voucher để hệ thống tự tính lại tổng tiền đơn hàng.';
    } catch (error) {
        select.disabled = true;
        resultEl.className = 'voucher-result error';
        resultEl.textContent = error.message || 'Không thể tải danh sách voucher của bạn.';
    }
}

function buildVoucherDiscountLabel(coupon) {
    if (coupon.discountType === 'FIXED_AMOUNT') {
        return `Giảm ${formatCurrency(coupon.fixedDiscountAmount || 0)}`;
    }
    return `Giảm ${coupon.discountPercent || 0}%`;
}

function calculateVoucherDiscount(coupon, subtotal) {
    if (!coupon || subtotal <= 0) {
        return 0;
    }

    if (coupon.discountType === 'FIXED_AMOUNT') {
        return Math.min(coupon.fixedDiscountAmount || 0, subtotal);
    }

    const percentDiscount = Math.round(subtotal * (coupon.discountPercent || 0) / 100);
    const maxDiscount = coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0
        ? coupon.maxDiscountAmount
        : percentDiscount;
    return Math.min(percentDiscount, maxDiscount, subtotal);
}

function applySelectedVoucher() {
    const select = document.getElementById('voucherSelect');
    const resultEl = document.getElementById('voucherResult');
    if (!select || !resultEl) return;

    const items = getCheckoutItems();
    const subtotal = getCurrentCheckoutSubtotal();
    setCurrentSubtotalValue(subtotal);

    if (!select.value) {
        setAppliedVoucherValue(null);
        setVoucherCodeDisplay('');
        resultEl.className = 'voucher-result';
        resultEl.textContent = 'Chọn voucher để hệ thống tự tính lại tổng tiền đơn hàng.';
        renderOrderSummary(items, 0);
        return;
    }

    const coupon = availableCustomerCoupons.find(item => String(item.id) === String(select.value));
    if (!coupon) {
        setAppliedVoucherValue(null);
        resultEl.className = 'voucher-result error';
        resultEl.textContent = 'Không tìm thấy voucher đã chọn.';
        renderOrderSummary(items, 0);
        return;
    }

    const minOrderValue = getCouponMinOrderValue(coupon);
    if (minOrderValue > subtotal) {
        setAppliedVoucherValue(null);
        setVoucherCodeDisplay('');
        resultEl.className = 'voucher-result error';
        resultEl.textContent = `Đơn hàng tối thiểu ${formatMinOrderValue(minOrderValue)} mới được dùng voucher này`;
        renderOrderSummary(items, 0);
        return;
    }

    const discountAmount = calculateVoucherDiscount(coupon, subtotal);
    setAppliedVoucherValue({ ...coupon, discountAmount });
    setVoucherCodeDisplay(coupon.code);
    resultEl.className = 'voucher-result success';
    resultEl.textContent = `${coupon.name || coupon.code}: ${coupon.discountLabel || buildVoucherDiscountLabel(coupon)}.`;
    renderOrderSummary(items, discountAmount);
}

function refreshVoucherState() {
    const items = getCheckoutItems();
    const select = document.getElementById('voucherSelect');
    if (!select) {
        renderOrderSummary(items, 0);
        return;
    }

    if (!select.value) {
        setCurrentSubtotalValue(getCurrentCheckoutSubtotal());
        renderOrderSummary(items, 0);
        return;
    }

    applySelectedVoucher();
}

window.refreshVoucherState = refreshVoucherState;

document.addEventListener('DOMContentLoaded', function() {
    ensureVoucherDropdownUI();
    loadAssignedVouchers();
});
