# Secondhand Shop Backend

Hệ thống quản lý bán hàng second-hand (admin + user) xây trên Spring Boot, phục vụ REST API và frontend tĩnh.

**Tóm tắt**
- Backend: Spring Boot 3.2.x, Java 17, JPA/Hibernate, MySQL, Spring Security + JWT.
- Frontend: HTML/CSS/JS tĩnh nằm trong `src/main/resources/static/`.
- Phân tách 2 khu vực: `admin/` và `user/`.

**Yêu cầu chạy**
- Java 17
- Maven (hoặc dùng `./mvnw`)
- MySQL

**Cấu hình mặc định**
- File: `src/main/resources/application.yml`
- DB:
  - `jdbc:mysql://localhost:3306/secondhand_shop`
  - user: `root`
  - pass: 
- JWT:
  - secret và thời hạn `expiration-ms` trong `app.jwt`.
- Admin mặc định (được khởi tạo khi `app.admin.enabled: true`):
  - username: `admin`
  - password: `admin123`

**Chạy ứng dụng**
```bash
./mvnw spring-boot:run
```
Ứng dụng chạy ở `http://localhost:8080`.

**Cấu trúc dự án**
- `src/main/java/com/secondhand/shop/`
  - `admin/`  
    Controller + Service + DTO cho admin.
  - `user/`  
    Controller + Service + DTO cho user.
  - `common/`  
    Entity (model), repository, support helpers.
  - `security/`  
    JWT service, custom user details.
  - `config/`  
    SecurityConfig, JWT filter, data initializer, migration helper.
- `src/main/resources/static/`
  - `admin/`  
    UI quản trị (products, orders, customers, categories, dashboard).
  - `user/`  
    UI khách hàng (index, products, cart, checkout, my-orders, profile).
  - `login.html`  
    Trang đăng nhập dùng chung.

**Luồng đăng nhập (JWT)**
- Client gọi `POST /api/auth/login` từ `login.html`.
- Response có JWT; lưu vào `localStorage`:
  - Admin: `adminUser` (xem `src/main/resources/static/admin/js/auth.js`)
  - User: `currentUser` (xem `src/main/resources/static/user/js/auth.js`)
- Request sau đó gắn `Authorization: Bearer <token>`:
  - Admin: `src/main/resources/static/admin/js/api.js`
  - User: `src/main/resources/static/user/js/api.js`
- Server xác thực bằng `JwtAuthenticationFilter` trong `src/main/java/com/secondhand/shop/config/JwtAuthenticationFilter.java`.

**Các module chính (Admin UI)**
- Quản lý sản phẩm: `src/main/resources/static/admin/products.html`
- Quản lý danh mục: `src/main/resources/static/admin/categories.html`
- Quản lý đơn hàng: `src/main/resources/static/admin/orders.html`
- Quản lý khách hàng + voucher: `src/main/resources/static/admin/customers.html`

**Các module chính (User UI)**
- Trang chủ: `src/main/resources/static/user/index.html`
- Sản phẩm: `src/main/resources/static/user/products.html`
- Giỏ hàng: `src/main/resources/static/user/cart.html`
- Thanh toán: `src/main/resources/static/user/checkout.html`
- Đơn hàng của tôi: `src/main/resources/static/user/my-orders.html`

**API chính**
- Auth: `POST /api/auth/login`, `POST /api/auth/register`
- Products: `/api/products`
- Categories: `/api/categories`
- Orders: `/api/orders` (admin), `/api/orders/checkout` (user)
- Customers: `/api/customers`
- Coupons: `/api/coupons`, `/api/coupons/validate`, `/api/coupons/me`

**Ghi chú kỹ thuật**
- JPA `ddl-auto: update` để tự cập nhật schema.
- Token hết hạn theo `app.jwt.expiration-ms`.
- Static assets được Spring Boot serve trực tiếp.

**Test**
```bash
./mvnw test
```
