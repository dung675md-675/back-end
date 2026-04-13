// ===================================
// PRODUCTS PAGE LOGIC - FIXED VERSION
// ===================================

let productsData = [];
let categoriesData = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading products page...');
    await loadInitialData();
});

// Load initial data
async function loadInitialData() {
    try {
        await Promise.all([
            loadProducts(),
            loadCategories()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Load all products
async function loadProducts() {
    try {
        console.log('Fetching products...');
        productsData = await fetchGet(API_ENDPOINTS.PRODUCTS);
        console.log('Products loaded:', productsData);
        renderProducts(productsData);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTableBody').innerHTML = 
            '<tr><td colspan="9">Lỗi khi tải dữ liệu: ' + error.message + '</td></tr>';
    }
}

// Load categories for filter and form
async function loadCategories() {
    try {
        console.log('Fetching categories...');
        categoriesData = await fetchGet(API_ENDPOINTS.CATEGORIES);
        console.log('Categories loaded:', categoriesData);
        
        // Fill category filter
        const filterSelect = document.getElementById('categoryFilter');
        filterSelect.innerHTML = '<option value="">Tất cả danh mục</option>' +
            categoriesData.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
        
        // Fill category form select
        const formSelect = document.getElementById('productCategory');
        formSelect.innerHTML = '<option value="">Chọn danh mục</option>' +
            categoriesData.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render products to table
function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">Chưa có sản phẩm nào</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
                <img src="${product.imageUrl || 'images/placeholder.png'}" 
                     alt="${product.name}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
            </td>
            <td><strong>${product.name}</strong></td>
            <td>${product.categoryName}</td>
            <td><strong style="color: var(--danger-color);">${formatCurrency(product.price)}</strong></td>
            <td>${product.quantity}</td>
            <td><span class="badge badge-info">${getConditionText(product.conditionStatus)}</span></td>
            <td><span class="badge badge-${getStatusBadgeClass(product.status)}">${getStatusText(product.status)}</span></td>
            <td>${product.views || 0}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">
                    Sửa
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                    Xóa
                </button>
            </td>
        </tr>
    `).join('');
}

// Search products
function searchProducts() {
    filterProducts();
}

// Filter products
function filterProducts() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const categoryId = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filtered = productsData;
    
    if (keyword) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(keyword) ||
            (product.description && product.description.toLowerCase().includes(keyword))
        );
    }
    
    if (categoryId) {
        filtered = filtered.filter(product => product.categoryId == categoryId);
    }
    
    if (status) {
        filtered = filtered.filter(product => product.status === status);
    }
    
    renderProducts(filtered);
}

// Open modal to add new product
function openProductModal() {
    console.log('Opening product modal...');
    document.getElementById('modalTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('show');
}

// Open modal to edit product
async function editProduct(id) {
    try {
        console.log('Loading product for edit:', id);
        const product = await fetchGet(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        console.log('Product data:', product);
        
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa sản phẩm';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productOriginalPrice').value = product.originalPrice || '';
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productCondition').value = product.conditionStatus;
        document.getElementById('productCategory').value = product.categoryId;
        document.getElementById('productImageUrl').value = product.imageUrl || '';
        document.getElementById('productStatus').value = product.status;
        
        document.getElementById('productModal').classList.add('show');
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Lỗi khi tải thông tin sản phẩm: ' + error.message, 'error');
    }
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
}

// Submit product form
async function submitProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('productId').value;
    
    // Validate category
    const categoryId = document.getElementById('productCategory').value;
    if (!categoryId) {
        showNotification('Vui lòng chọn danh mục!', 'error');
        return;
    }
    
    // Build data object
    const data = {
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim() || null,
        price: parseFloat(document.getElementById('productPrice').value),
        originalPrice: document.getElementById('productOriginalPrice').value ? 
            parseFloat(document.getElementById('productOriginalPrice').value) : null,
        quantity: parseInt(document.getElementById('productQuantity').value),
        conditionStatus: document.getElementById('productCondition').value,
        categoryId: parseInt(categoryId),
        imageUrl: document.getElementById('productImageUrl').value.trim() || null,
        status: document.getElementById('productStatus').value
    };
    
    // Validate data
    if (!data.name) {
        showNotification('Vui lòng nhập tên sản phẩm!', 'error');
        return;
    }
    
    if (isNaN(data.price) || data.price <= 0) {
        showNotification('Giá sản phẩm không hợp lệ!', 'error');
        return;
    }
    
    if (isNaN(data.quantity) || data.quantity < 1) {
        showNotification('Số lượng không hợp lệ!', 'error');
        return;
    }

    console.log('Submitting product data:', data);

    try {
        if (id) {
            // Update
            console.log('Updating product:', id);
            await fetchPut(`${API_ENDPOINTS.PRODUCTS}/${id}`, data);
            showNotification('Cập nhật sản phẩm thành công!', 'success');
        } else {
            // Create
            console.log('Creating new product');
            await fetchPost(API_ENDPOINTS.PRODUCTS, data);
            showNotification('Thêm sản phẩm thành công!', 'success');
        }
        
        closeProductModal();
        await loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Lỗi khi lưu sản phẩm: ' + error.message, 'error');
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }

    try {
        console.log('Deleting product:', id);
        await fetchDelete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        showNotification('Xóa sản phẩm thành công!', 'success');
        await loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Lỗi khi xóa sản phẩm: ' + error.message, 'error');
    }
}

// ===================================
// MODAL THÊM DANH MỤC MỚI
// ===================================

function openAddCategoryModal() {
    console.log('Opening add category modal...');
    document.getElementById('addCategoryForm').reset();
    document.getElementById('addCategoryModal').classList.add('show');
}

function closeAddCategoryModal() {
    document.getElementById('addCategoryModal').classList.remove('show');
}

async function submitNewCategory(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('newCategoryName').value.trim(),
        description: document.getElementById('newCategoryDescription').value.trim() || null,
        imageUrl: document.getElementById('newCategoryImageUrl').value.trim() || 'https://via.placeholder.com/300x200?text=Category',
        status: 'ACTIVE'
    };
    
    if (!data.name) {
        showNotification('Vui lòng nhập tên danh mục!', 'error');
        return;
    }

    console.log('Creating new category:', data);

    try {
        const newCategory = await fetchPost(API_ENDPOINTS.CATEGORIES, data);
        showNotification('Thêm danh mục thành công!', 'success');
        
        // Reload categories
        await loadCategories();
        
        // Set new category as selected
        document.getElementById('productCategory').value = newCategory.id;
        
        closeAddCategoryModal();
    } catch (error) {
        console.error('Error creating category:', error);
        showNotification('Lỗi khi thêm danh mục: ' + error.message, 'error');
    }
}

// Helper functions
function getStatusBadgeClass(status) {
    const classes = {
        'AVAILABLE': 'success',
        'SOLD': 'secondary',
        'RESERVED': 'warning',
        'DELETED': 'danger'
    };
    return classes[status] || 'secondary';
}

function getStatusText(status) {
    const texts = {
        'AVAILABLE': 'Còn hàng',
        'SOLD': 'Đã bán',
        'RESERVED': 'Đã đặt',
        'DELETED': 'Đã xóa'
    };
    return texts[status] || status;
}

function getConditionText(condition) {
    const texts = {
        'NEW': 'Mới',
        'LIKE_NEW': 'Như mới',
        'GOOD': 'Tốt',
        'FAIR': 'Khá',
        'POOR': 'Cũ'
    };
    return texts[condition] || condition;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const categoryModal = document.getElementById('addCategoryModal');
    
    if (event.target === productModal) {
        closeProductModal();
    }
    if (event.target === categoryModal) {
        closeAddCategoryModal();
    }
}