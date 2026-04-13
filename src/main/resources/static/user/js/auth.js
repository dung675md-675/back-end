// ===================================
// AUTHENTICATION LOGIC
// ===================================

const RANK_INFO = {
    BRONZE:   { label: 'Đồng',     icon: '🥉', color: '#cd7f32', bg: '#fdf0e6' },
    SILVER:   { label: 'Bạc',      icon: '🥈', color: '#808080', bg: '#f0f0f0' },
    GOLD:     { label: 'Vàng',     icon: '🥇', color: '#b8860b', bg: '#fffbe6' },
    PLATINUM: { label: 'Bạch kim', icon: '💎', color: '#1565c0', bg: '#e8f4fd' },
    DIAMOND:  { label: 'Kim cương',icon: '💠', color: '#6a1b9a', bg: '#f3e5f5' }
};

// Tính rank dựa trên totalSpent
function calculateRank(totalSpent) {
    const spent = totalSpent || 0;
    if (spent < 1000000)  return 'BRONZE';
    if (spent < 5000000)  return 'SILVER';
    if (spent < 20000000) return 'GOLD';
    if (spent < 50000000) return 'PLATINUM';
    return 'DIAMOND';
}

function saveUserData(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

function saveLoginSession(userData, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("Đã lưu session thành công");
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('checkoutItems');
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    window.location.href = '../login.html';
}

function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// Lấy rank từ API customer (nếu có) hoặc tính từ local
async function getUserRank(user) {
    try {
        const customer = await fetchGet(API_ENDPOINTS.CUSTOMER_ME);
        if (customer && customer.rank) return customer.rank;
        if (customer && customer.totalSpent !== undefined) return calculateRank(customer.totalSpent);
    } catch (e) {}
    return calculateRank(0);
}

function updateAuthUI() {
    const user = getCurrentUser();
    const userMenuElement = document.getElementById('userMenu');
    if (!userMenuElement) return;

    if (user) {
        const firstLetter = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
        // Render trước với rank placeholder, sau đó fetch rank thật
        renderUserMenu(userMenuElement, user, firstLetter, null);
        // Fetch rank thật từ API
        getUserRank(user).then(rank => {
            renderUserMenu(userMenuElement, user, firstLetter, rank);
        });
    } else {
        userMenuElement.innerHTML = `
            <div class="guest-menu">
                <a href="../login.html" class="login-btn">Đăng nhập</a>
                <a href="../login.html" class="register-btn">Đăng ký</a>
            </div>
        `;
    }
}

function renderUserMenu(userMenuElement, user, firstLetter, rank) {
    const rankData = rank ? (RANK_INFO[rank] || RANK_INFO.BRONZE) : null;

    const rankBadgeHeader = rankData ? `
        <div style="display:inline-flex;align-items:center;gap:5px;margin-top:6px;
                    background:${rankData.bg};color:${rankData.color};
                    padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">
            ${rankData.icon} Hạng ${rankData.label}
        </div>
    ` : `<div style="height:22px;margin-top:6px;"></div>`;

    const rankBadgeAvatar = rankData ? `
        <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
                    background:${rankData.bg};color:${rankData.color};
                    border:2px solid white;border-radius:20px;
                    padding:1px 7px;font-size:10px;font-weight:700;white-space:nowrap;">
            ${rankData.icon} ${rankData.label}
        </div>
    ` : '';

    userMenuElement.innerHTML = `
        <div class="user-menu" id="userMenuDropdown">
            <div class="user-menu-trigger" onclick="toggleUserMenu()">
                <div class="user-avatar">${firstLetter}</div>
                <div class="user-info">
                    <span class="user-greeting">Xin chào,</span>
                    <span class="user-name">${user.fullName}</span>
                </div>
                <span class="dropdown-arrow">▼</span>
            </div>

            <div class="user-dropdown">
                <div class="dropdown-header" style="text-align:center;padding-bottom:14px;">
                    <div style="position:relative;display:inline-block;margin-bottom:10px;">
                        <div style="width:56px;height:56px;border-radius:50%;
                                    background:linear-gradient(135deg,#6c3fc5,#9b59b6);
                                    display:flex;align-items:center;justify-content:center;
                                    font-size:24px;font-weight:700;color:white;margin:0 auto;">
                            ${firstLetter}
                        </div>
                        ${rankBadgeAvatar}
                    </div>
                    <div class="dropdown-header-name" style="font-weight:700;font-size:15px;">${user.fullName}</div>
                    <div class="dropdown-header-email" style="font-size:12px;color:#888;">${user.email}</div>
                    ${rankBadgeHeader}
                </div>

                <ul class="dropdown-menu">
                    <li>
                        <a href="cart.html">
                            <span class="dropdown-icon"></span>
                            <span>Giỏ hàng</span>
                        </a>
                    </li>
                    <li>
                        <a href="my-orders.html">
                            <span class="dropdown-icon"></span>
                            <span>Đơn hàng của tôi</span>
                        </a>
                    </li>
                    <li>
                        <a href="profile.html">
                            <span class="dropdown-icon"></span>
                            <span>Tài khoản</span>
                        </a>
                    </li>
                    <li><div class="dropdown-divider"></div></li>
                    <li>
                        <button class="dropdown-logout" onclick="logout()">
                            <span class="dropdown-icon"></span>
                            <span>Đăng xuất</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenuDropdown');
    if (menu) menu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
    const menu = document.getElementById('userMenuDropdown');
    if (menu && !menu.contains(event.target)) {
        menu.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    updateCartBadge();
});

Object.assign(RANK_INFO, {
    BRONZE: { label: 'Đồng', icon: 'B', color: '#a0522d', bg: '#fdf0e6' },
    SILVER: { label: 'Bạc', icon: 'S', color: '#808080', bg: '#f0f0f0' },
    GOLD: { label: 'Vàng', icon: 'G', color: '#b8860b', bg: '#fffbe6' },
    PLATINUM: { label: 'Bạch kim', icon: 'P', color: '#1565c0', bg: '#e8f4fd' },
    DIAMOND: { label: 'Kim cương', icon: 'D', color: '#6a1b9a', bg: '#f3e5f5' },
    VIP_A: { label: 'VIP A', icon: 'A', color: '#00897b', bg: '#e0f2f1' },
    VIP_S: { label: 'VIP S', icon: 'S+', color: '#ef6c00', bg: '#fff3e0' },
    VIP_SS: { label: 'VIP SS', icon: 'SS', color: '#c62828', bg: '#ffebee' },
    VIP_SSS: { label: 'VIP SSS', icon: 'SSS', color: '#283593', bg: '#e8eaf6' }
});

function calculateRank(totalSpent) {
    const spent = totalSpent || 0;
    if (spent < 1000000) return 'BRONZE';
    if (spent < 5000000) return 'SILVER';
    if (spent < 10000000) return 'GOLD';
    if (spent < 15000000) return 'PLATINUM';
    if (spent < 20000000) return 'DIAMOND';
    if (spent < 30000000) return 'VIP_A';
    if (spent < 50000000) return 'VIP_S';
    if (spent < 100000000) return 'VIP_SS';
    return 'VIP_SSS';
}
