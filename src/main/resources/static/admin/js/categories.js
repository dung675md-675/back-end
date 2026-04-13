// ===================================
// CATEGORIES PAGE LOGIC
// ===================================

let categoriesData = [];

// Load categories on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
});

// Load all categories
async function loadCategories() {
    try {
        categoriesData = await fetchGet(API_ENDPOINTS.CATEGORIES);
        renderCategories(categoriesData);
    } catch (error) {
        document.getElementById('categoriesTableBody').innerHTML = 
            '<tr><td colspan="6">Lỗi khi tải dữ liệu</td></tr>';
    }
}

// Render categories to table
function renderCategories(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Chưa có danh mục nào</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>
                <img src="${category.imageUrl || 'images/placeholder.png'}" 
                     alt="${category.name}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
            </td>
            <td><strong>${category.name}</strong></td>
            <td>${category.description || '-'}</td>
            <td>
                <span class="badge badge-${category.status === 'ACTIVE' ? 'success' : 'secondary'}">
                    ${category.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            </td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="editCategory(${category.id})">
                    Sửa
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">
                    Xóa
                </button>
            </td>
        </tr>
    `).join('');
}

// Search categories
function searchCategories() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const filtered = categoriesData.filter(category => 
        category.name.toLowerCase().includes(keyword) ||
        (category.description && category.description.toLowerCase().includes(keyword))
    );
    renderCategories(filtered);
}

// Open modal to add new category
function openCategoryModal() {
    document.getElementById('modalTitle').textContent = 'Thêm danh mục mới';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModal').classList.add('show');
}

// Open modal to edit category
async function editCategory(id) {
    try {
        const category = await fetchGet(`${API_ENDPOINTS.CATEGORIES}/${id}`);
        
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa danh mục';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryImageUrl').value = category.imageUrl || '';
        document.getElementById('categoryStatus').value = category.status;
        
        document.getElementById('categoryModal').classList.add('show');
    } catch (error) {
        console.error('Error loading category:', error);
    }
}

// Close modal
function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('show');
}

// Submit form (Create or Update)
async function submitCategory(event) {
    event.preventDefault();
    
    const id = document.getElementById('categoryId').value;
    const data = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        imageUrl: document.getElementById('categoryImageUrl').value,
        status: document.getElementById('categoryStatus').value
    };

    try {
        if (id) {
            // Update
            await fetchPut(`${API_ENDPOINTS.CATEGORIES}/${id}`, data);
            showNotification('Cập nhật danh mục thành công!', 'success');
        } else {
            // Create
            await fetchPost(API_ENDPOINTS.CATEGORIES, data);
            showNotification('Thêm danh mục thành công!', 'success');
        }
        
        closeCategoryModal();
        loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
    }
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
        return;
    }

    try {
        await fetchDelete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
        showNotification('Xóa danh mục thành công!', 'success');
        loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('categoryModal');
    if (event.target === modal) {
        closeCategoryModal();
    }
}