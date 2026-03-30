// ===================================
// ADMIN AUTHENTICATION
// ===================================

function saveAdminData(data) {
    localStorage.setItem('adminUser', JSON.stringify(data));
}

function getAdminUser() {
    const d = localStorage.getItem('adminUser');
    return d ? JSON.parse(d) : null;
}

function isAdminLoggedIn() {
    const u = getAdminUser();
    return u !== null && u.role === 'ADMIN';
}

function logoutAdmin() {
    localStorage.removeItem('adminUser');
    window.location.href = '../login.html';
}

function requireAdmin() {
    if (!isAdminLoggedIn()) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

// Hiển thị tên admin trên header
document.addEventListener('DOMContentLoaded', function () {
    requireAdmin();
    const user = getAdminUser();
    const el = document.getElementById('adminNameDisplay');
    if (el && user) el.textContent = user.fullName || user.username;
});