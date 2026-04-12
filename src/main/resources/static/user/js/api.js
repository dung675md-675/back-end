// ===================================
// FETCH API HELPER FUNCTIONS
// ===================================

function getAuthHeaders() {
    let token = null;
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            token = JSON.parse(currentUser).token;
        }
    } catch (e) {}
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
        throw error;
    }
}

async function fetchPost(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Lỗi đăng nhập');
    }
    return await response.json();
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