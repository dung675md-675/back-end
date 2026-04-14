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

const LEGACY_CART_KEY = 'cart';
const CART_KEY_PREFIX = 'cart_user_';
const GUEST_CART_KEY = 'cart_guest';
const PENDING_CART_KEY = 'pendingAddToCart';
const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect';

function getCurrentCartUser() {
    if (typeof getCurrentUser !== 'function') {
        return null;
    }

    const user = getCurrentUser();
    return user && user.userId ? user : null;
}

function getCartStorageKey() {
    const user = getCurrentCartUser();
    return user ? `${CART_KEY_PREFIX}${user.userId}` : GUEST_CART_KEY;
}

function readCartByKey(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Invalid cart data:', error);
        return [];
    }
}

function normalizeCartItem(productIdOrItem, productName, price, imageUrl, quantity = 1) {
    if (typeof productIdOrItem === 'object' && productIdOrItem !== null) {
        return {
            productId: productIdOrItem.productId,
            productName: productIdOrItem.productName,
            price: productIdOrItem.price,
            imageUrl: productIdOrItem.imageUrl || '',
            quantity: Math.max(1, parseInt(productIdOrItem.quantity, 10) || 1)
        };
    }

    return {
        productId: productIdOrItem,
        productName: productName,
        price: price,
        imageUrl: imageUrl || '',
        quantity: Math.max(1, parseInt(quantity, 10) || 1)
    };
}

function mergeCartItems(targetCart, item) {
    const existingItem = targetCart.find(cartItem => cartItem.productId === item.productId);
    if (existingItem) {
        existingItem.quantity += item.quantity;
        return true;
    }

    targetCart.push(item);
    return false;
}

function migrateLegacyCartForCurrentUser() {
    const user = getCurrentCartUser();
    if (!user) return;

    const scopedKey = getCartStorageKey();
    const scopedCart = readCartByKey(scopedKey);
    const legacyCart = readCartByKey(LEGACY_CART_KEY);

    if (legacyCart.length === 0) return;

    const mergedCart = [...scopedCart];
    legacyCart.forEach(item => {
        mergeCartItems(mergedCart, normalizeCartItem(item));
    });

    localStorage.setItem(scopedKey, JSON.stringify(mergedCart));
    localStorage.removeItem(LEGACY_CART_KEY);
}

function requireLoginForCart(item) {
    sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(item));
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, window.location.pathname + window.location.search);
    showNotification('Vui long dang nhap de them san pham vao gio hang.', 'warning');
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 500);
    return false;
}

function processPendingCartActionAfterLogin(defaultRedirect = 'user/index.html') {
    migrateLegacyCartForCurrentUser();

    const redirectUrl = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) || defaultRedirect;
    const pendingRaw = sessionStorage.getItem(PENDING_CART_KEY);

    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    sessionStorage.removeItem(PENDING_CART_KEY);

    if (pendingRaw) {
        try {
            const pendingItem = JSON.parse(pendingRaw);
            addToCart(pendingItem);
        } catch (error) {
            console.error('Cannot restore pending cart item:', error);
        }
    }

    return redirectUrl;
}

async function validateCart() {
    const cart = getCart();
    const validCart = [];
    let hasInvalidItems = false;

    for (const item of cart) {
        try {
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
        showNotification('Mot so san pham da bi xoa khoi gio hang vi khong con kha dung', 'warning');
        return validCart;
    }

    return cart;
}

function getCart() {
    migrateLegacyCartForCurrentUser();
    return readCartByKey(getCartStorageKey());
}

function saveCart(cart) {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(productIdOrItem, productName, price, imageUrl, quantity = 1) {
    const item = normalizeCartItem(productIdOrItem, productName, price, imageUrl, quantity);

    if (!isLoggedIn()) {
        return requireLoginForCart(item);
    }

    const cart = getCart();
    const existed = mergeCartItems(cart, item);
    saveCart(cart);

    if (existed) {
        showNotification('Đã cập nhật số lượng trong giỏ!', 'success');
    } else {
        showNotification('Đã thêm vào giỏ hàng!', 'success');
    }

    return true;
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);

    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
}

function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(cartItem => cartItem.productId === productId);

    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);

            if (window.location.pathname.includes('cart.html')) {
                loadCartItems();
            }
        }
    }
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = getCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

function clearCart() {
    localStorage.removeItem(getCartStorageKey());
    updateCartBadge();
}
