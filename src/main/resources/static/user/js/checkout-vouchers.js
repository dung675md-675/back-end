let availableCustomerCoupons = [];

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
            option.textContent = `${coupon.name || coupon.code} | ${coupon.code} | ${coupon.discountLabel || buildVoucherDiscountLabel(coupon)}`;
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

function applySelectedVoucher() {
    const select = document.getElementById('voucherSelect');
    const resultEl = document.getElementById('voucherResult');
    if (!select || !resultEl) return;

    if (!select.value) {
        appliedVoucher = null;
        document.getElementById('voucherCodeDisplay').textContent = '';
        resultEl.className = 'voucher-result';
        resultEl.textContent = 'Chọn voucher để hệ thống tự tính lại tổng tiền đơn hàng.';
        renderOrderSummary(currentItems, 0);
        return;
    }

    const coupon = availableCustomerCoupons.find(item => String(item.id) === String(select.value));
    if (!coupon) {
        appliedVoucher = null;
        resultEl.className = 'voucher-result error';
        resultEl.textContent = 'Không tìm thấy voucher đã chọn.';
        renderOrderSummary(currentItems, 0);
        return;
    }

    if ((coupon.minOrderAmount || 0) > currentSubtotal) {
        appliedVoucher = null;
        resultEl.className = 'voucher-result error';
        resultEl.textContent = `Voucher này chỉ áp dụng cho đơn từ ${formatCurrency(coupon.minOrderAmount)}.`;
        document.getElementById('voucherCodeDisplay').textContent = '';
        renderOrderSummary(currentItems, 0);
        return;
    }

    const discountAmount = calculateVoucherDiscount(coupon, currentSubtotal);
    appliedVoucher = { ...coupon, discountAmount };
    document.getElementById('voucherCodeDisplay').textContent = `(${coupon.code})`;
    resultEl.className = 'voucher-result success';
    resultEl.textContent = `${coupon.name || coupon.code}: ${coupon.discountLabel || buildVoucherDiscountLabel(coupon)}.`;
    renderOrderSummary(currentItems, discountAmount);
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

async function handlePlaceOrder(items) {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const note = document.getElementById('note').value.trim();

    if (!fullName || !phone || !address) {
        showNotification('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.', 'warning');
        return;
    }

    let customerId;
    try {
        const customer = await fetchGet(API_ENDPOINTS.CUSTOMER_ME);
        customerId = customer.id;
    } catch (error) {
        showNotification('Không tìm thấy thông tin khách hàng. Vui lòng liên hệ hỗ trợ.', 'error');
        return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
    const finalAmount = Math.max(0, subtotal - discountAmount);

    const orderItems = items.map(item => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
    }));

    const payload = {
        customerId,
        shippingAddress: address,
        shippingPhone: phone,
        note,
        totalAmount: subtotal,
        discountAmount,
        finalAmount,
        couponId: appliedVoucher ? appliedVoucher.id : null,
        orderItems
    };

    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.textContent = 'Đang tạo đơn hàng...';

    try {
        await fetchPost(API_ENDPOINTS.ORDERS + '/checkout', payload);

        const checkoutIds = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
        let cart = getCart();
        cart = cart.filter(item => !checkoutIds.includes(item.productId));
        saveCart(cart);
        localStorage.removeItem('checkoutItems');

        showNotification('Đặt hàng thành công!', 'success');
        setTimeout(() => { window.location.href = 'my-orders.html'; }, 1500);
    } catch (error) {
        showNotification('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.', 'error');
        btn.disabled = false;
        btn.textContent = 'Đặt hàng';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    ensureVoucherDropdownUI();
    loadAssignedVouchers();
});
