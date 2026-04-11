// ===================================
// FETCH API HELPER FUNCTIONS
// ===================================

function getAuthHeaders() {
    const adminUser = localStorage.getItem('adminUser');
    let token = null;
    if (adminUser) {
        try {
            token = JSON.parse(adminUser).token;
        } catch (e) {}
    }
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function fetchGet(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('GET Error:', error);
        showNotification('Lỗi khi tải dữ liệu: ' + error.message, 'error');
        throw error;
    }
}

async function fetchPost(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('POST Error:', error);
        showNotification('Lỗi khi tạo dữ liệu: ' + error.message, 'error');
        throw error;
    }
}

async function fetchPut(url, data) {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('PUT Error:', error);
        showNotification('Lỗi khi cập nhật dữ liệu: ' + error.message, 'error');
        throw error;
    }
}

async function fetchDelete(url) {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error('DELETE Error:', error);
        showNotification('Lỗi khi xóa dữ liệu: ' + error.message, 'error');
        throw error;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => { notification.classList.add('show'); }, 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => { document.body.removeChild(notification); }, 300);
    }, 3000);
}