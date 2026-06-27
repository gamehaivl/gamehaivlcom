# GAMEHAIVL GitHub Pages - bản đã fix load

## Cách upload đúng

1. Giải nén file ZIP này.
2. Upload **toàn bộ file bên trong thư mục** lên root repo GitHub, không upload nguyên thư mục bọc bên ngoài.
3. Repo phải có `index.html` nằm ngay ở root, cùng cấp với `.nojekyll`, `404.html`, `robots.txt`.
4. Vào Settings → Pages → Build and deployment → Deploy from branch → chọn `main` và `/root`.

## Bản fix này đã xử lý

- CSS và JS được nhúng trực tiếp trong `index.html`, nên không còn lỗi trắng giao diện do sai đường dẫn asset.
- Có `.nojekyll` để GitHub Pages không xử lý nhầm thư mục asset.
- Có `404.html` giống trang chủ để hạn chế lỗi khi vào URL phụ.
- Có fallback ảnh nếu ảnh từ domain gốc không tải được.
- Không phụ thuộc WordPress, PHP, wp-json, Flatsome JS, jQuery hoặc admin bar.

## Lưu ý

Các nút bài viết vẫn trỏ về domain gốc `https://gamehaivl.com/...`. Nếu muốn biến GitHub Pages thành site độc lập hoàn toàn, cần tạo thêm từng file HTML cho từng bài viết.
