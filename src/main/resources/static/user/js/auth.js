// ===================================
// AUTHENTICATION LOGIC
// ===================================

// Lưu thông tin user vào localStorage
function saveUserData(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

function saveLoginSession(userData, token) {
    // Lưu token để gọi API
    localStorage.setItem('token', token);
    // Lưu thông tin user để hiển thị (Quan trọng: phải có userId)
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("Đã lưu session thành công");
}

// Lấy thông tin user từ localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Kiểm tra đã đăng nhập chưa
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart'); // Xóa giỏ hàng
    window.location.href = '../login.html';
}

// Kiểm tra quyền truy cập (chỉ user đăng nhập mới vào được)
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// Update UI theo trạng thái đăng nhập
function updateAuthUI() {
    const user = getCurrentUser();
    const userMenuElement = document.getElementById('userMenu');
    
    if (!userMenuElement) return;
    
    if (user) {
        // User đã đăng nhập - Hiển thị dropdown menu
        const firstLetter = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
        
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
                    <div class="dropdown-header">
                        <div class="dropdown-header-name">${user.fullName}</div>
                        <div class="dropdown-header-email">${user.email}</div>
                    </div>
                    
                    <ul class="dropdown-menu">
                        <li>
                            <a href="cart.html">
                                <span class="dropdown-icon">🛒</span>
                                <span>Giỏ hàng</span>
                            </a>
                        </li>
                        <li>
                            <a href="my-orders.html">
                                <span class="dropdown-icon">📦</span>
                                <span>Đơn hàng của tôi</span>
                            </a>
                        </li>
                        <li>
                            <a href="profile.html">
                                <span class="dropdown-icon">👤</span>
                                <span>Tài khoản</span>
                            </a>
                        </li>
                        <li><div class="dropdown-divider"></div></li>
                        <li>
                            <button class="dropdown-logout" onclick="logout()">
                                <span class="dropdown-icon">🚪</span>
                                <span>Đăng xuất</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        // Guest - Hiển thị nút đăng nhập/đăng ký
        userMenuElement.innerHTML = `
            <div class="guest-menu">
                <a href="../login.html" class="login-btn">Đăng nhập</a>
                <a href="../login.html" class="register-btn">Đăng ký</a>
            </div>
        `;
    }
}

// Toggle dropdown menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenuDropdown');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Đóng dropdown khi click outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('userMenuDropdown');
    if (menu && !menu.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// Gọi khi trang load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    updateCartBadge();
});