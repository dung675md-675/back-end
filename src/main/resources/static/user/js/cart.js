// ===================================
// SHOPPING CART LOGIC
// ===================================

// Kiểm tra và làm sạch giỏ hàng (xóa sản phẩm không còn tồn tại)
async function validateCart() {
    const cart = getCart();
    const validCart = [];
    let hasInvalidItems = false;
    
    for (const item of cart) {
        try {
            // Kiểm tra sản phẩm còn tồn tại không
            const product = await fetchGet(`${API_ENDPOINTS.PRODUCTS}/${item.productId}`);
            
            if (product && product.status === 'AVAILABLE') {
                validCart.push(item);
            } else {
                hasInvalidItems = true;
                console.log('Removed invalid product:', item.productName);
            }
        } catch (error) {
            hasInvalidItems = true;
            console.log('Removed deleted product:', item.productName);
        }
    }
    
    if (hasInvalidItems) {
        saveCart(validCart);
        showNotification('Một số sản phẩm đã bị xóa khỏi giỏ hàng vì không còn khả dụng', 'warning');
        return validCart;
    }
    
    return cart;
}

// Lấy giỏ hàng từ localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Lưu giỏ hàng vào localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// Thêm sản phẩm vào giỏ
function addToCart(productId, productName, price, imageUrl) {
    let cart = getCart();
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification('Đã cập nhật số lượng trong giỏ hàng!', 'success');
    } else {
        cart.push({
            productId: productId,
            productName: productName,
            price: price,
            imageUrl: imageUrl,
            quantity: 1
        });
        showNotification('Đã thêm vào giỏ hàng!', 'success');
    }
    
    saveCart(cart);
}

// Xóa sản phẩm khỏi giỏ
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
    
    // Reload cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
}

// Cập nhật số lượng
function updateCartQuantity(productId, quantity) {
    let cart = getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
            
            // Reload cart page if on cart page
            if (window.location.pathname.includes('cart.html')) {
                loadCartItems();
            }
        }
    }
}

// Đếm số lượng sản phẩm trong giỏ
function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Tính tổng tiền
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Cập nhật badge giỏ hàng
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = getCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Xóa toàn bộ giỏ hàng
function clearCart() {
    localStorage.removeItem('cart');
    updateCartBadge();
}