/**
 * File: js/user-products.js
 * Quản lý logic hiển thị sản phẩm và chi tiết sản phẩm
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Tự động xác định trang đang đứng để chạy logic tương ứng
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === 'products.html') {
        initProductsPage();
    } else if (page === 'product-detail.html') {
        initProductDetailPage();
    }
});

// --- TRANG DANH SÁCH SẢN PHẨM (products.html) ---

async function initProductsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchKeyword = urlParams.get('search');
    const categoryId = urlParams.get('category');

    // Load danh mục vào dropdown
    await loadCategoriesToFilter();

    if (searchKeyword) {
        document.querySelector('h1').textContent = `Kết quả tìm kiếm: "${searchKeyword}"`;
        searchProducts(searchKeyword);
    } else if (categoryId) {
        loadProductsByCategory(categoryId);
    } else {
        loadAllProducts();
    }
}

async function loadAllProducts() {
    try {
        const products = await fetchGet(API_ENDPOINTS.PRODUCTS);
        renderProducts(products);
    } catch (error) {
        console.error('Lỗi load sản phẩm:', error);
    }
}

async function loadCategoriesToFilter() {
    try {
        const categories = await fetchGet(API_ENDPOINTS.CATEGORIES);
        const filterSelect = document.getElementById('categoryFilter');
        if (!filterSelect) return;

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            filterSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi load danh mục:', error);
    }
}

async function filterProducts() {
    const categoryId = document.getElementById('categoryFilter').value;
    const container = document.getElementById('productsContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    if (!categoryId) {
        loadAllProducts();
    } else {
        try {
            const products = await fetchGet(`${API_ENDPOINTS.PRODUCTS}/category/${categoryId}`);
            renderProducts(products);
        } catch (error) {
            console.error('Lỗi lọc sản phẩm:', error);
        }
    }
}

async function searchProducts(keyword) {
    try {
        const products = await fetchGet(`${API_ENDPOINTS.PRODUCTS}/search?keyword=${encodeURIComponent(keyword)}`);
        renderProducts(products);
    } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
    }
}

// --- TÌM KIẾM TRỰC TIẾP (Gợi ý tìm kiếm) ---
let searchTimeout = null;

async function handleSearchInput(event) {
    const keyword = event.target.value.trim();
    const suggestionsBox = document.getElementById('searchSuggestions');
    
    if (event.key === 'Enter') {
        if (keyword) {
            window.location.href = `products.html?search=${encodeURIComponent(keyword)}`;
        } else {
            window.location.href = 'products.html';
        }
        return;
    }

    if (keyword.length < 2) {
        if (suggestionsBox) suggestionsBox.style.display = 'none';
        return;
    }

    // Debounce API calls (300ms)
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const products = await fetchGet(`${API_ENDPOINTS.PRODUCTS}/search?keyword=${encodeURIComponent(keyword)}`);
            if (suggestionsBox) {
                if (products && products.length > 0) {
                    const html = products.slice(0, 5).map(p => `
                        <div class="suggestion-item" onclick="window.location.href='product-detail.html?id=${p.id}'" style="display: flex; align-items: center; padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; gap: 10px; transition: background 0.2s;">
                            <img src="${p.imageUrl || 'images/placeholder.png'}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='images/placeholder.png'">
                            <div>
                                <div style="font-weight: 500; font-size: 0.9rem; color: #333;">${p.name}</div>
                                <div style="color: #ee4d2d; font-size: 0.85rem; font-weight: 600;">${formatCurrency(p.price)}</div>
                            </div>
                        </div>
                    `).join('');
                    
                    suggestionsBox.innerHTML = html + `
                        <div style="text-align: center; padding: 10px; font-size: 0.85rem; color: #888; cursor: pointer; background: #fafafa;" onclick="window.location.href='products.html?search=${encodeURIComponent(keyword)}'">
                            Xem tất cả kết quả cho "${keyword}"
                        </div>
                    `;
                    suggestionsBox.style.display = 'block';
                } else {
                    suggestionsBox.innerHTML = '<div style="padding: 10px; text-align: center; color: #888; font-size: 0.9rem;">Không tìm thấy sản phẩm phù hợp</div>';
                    suggestionsBox.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Lỗi lấy gợi ý:', error);
        }
    }, 300);
}

// Ẩn gợi ý khi click ra ngoài
document.addEventListener('click', function(e) {
    const searchBox = document.querySelector('.search-box');
    const suggestionsBox = document.getElementById('searchSuggestions');
    if (searchBox && !searchBox.contains(e.target)) {
        if(suggestionsBox) suggestionsBox.style.display = 'none';
    }
});

// --- TRANG CHI TIẾT SẢN PHẨM (product-detail.html) ---

async function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    try {
        const product = await fetchGet(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
        renderProductDetail(product);
    } catch (error) {
        console.error('Lỗi tải chi tiết sản phẩm:', error);
        document.getElementById('productDetail').innerHTML = '<p>Sản phẩm không tồn tại hoặc đã bị xóa.</p>';
    }
}

function renderProductDetail(product) {
    const container = document.getElementById('productDetail');
    if (!container) return;

    container.innerHTML = `
        <div class="detail-image-section">
            <img src="${product.imageUrl || 'images/placeholder.png'}" alt="${product.name}" class="detail-image">
        </div>
        <div class="detail-info-section">
            <div class="product-category-badge">${product.categoryName}</div>
            <h1 class="product-title">${product.name}</h1>
            <div class="price-large">${formatCurrency(product.price)}</div>
            
            <div class="product-meta">
                <p><strong>Tình trạng:</strong> Đồ cũ (Secondhand)</p>
                <p><strong>Người bán:</strong> ${product.sellerName || 'Cửa hàng'}</p>
                <p><strong>Lượt xem:</strong> ${product.views || 0}</p>
            </div>

            <div class="product-description">
                <h3>Mô tả sản phẩm</h3>
                <p>${product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
            </div>

            <div class="detail-actions">
                <button class="btn btn-primary btn-block" 
                        onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.imageUrl || ''}')">
                    🛒 Thêm vào giỏ hàng
                </button>
                <button class="btn btn-outline btn-block" onclick="contactSeller(${product.id})">
                    💬 Liên hệ người bán
                </button>
            </div>
        </div>
    <img src="${p.imageUrl || 'images/placeholder.png'}" 
      onerror="this.src='images/placeholder.png'" 
      class="product-image">
    `;
}

function contactSeller(productId) {
    showNotification('Tính năng chat đang được phát triển!', 'info');
}

// --- HÀM RENDER CHUNG ---

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Không tìm thấy sản phẩm nào.</p>';
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'">
            <div class="product-image-wrapper">
                <img src="${p.imageUrl || 'images/placeholder.png'}" alt="${p.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-category">${p.categoryName}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${formatCurrency(p.price)}</div>
                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${p.id}, '${p.name}', ${p.price}, '${p.imageUrl || ''}')">
                    🛒 Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join('');
}