# GAMEHAIVL GitHub Pages Static

Bộ code này đã được chuyển từ HTML WordPress/Flatsome sang bản tĩnh để chạy ổn trên GitHub Pages.

## Cách dùng nhanh

1. Tạo repository mới trên GitHub.
2. Upload toàn bộ file trong thư mục này lên nhánh `main`.
3. Vào **Settings → Pages**.
4. Chọn **Deploy from a branch** → branch `main` → folder `/root`.
5. Bấm **Save** và mở link GitHub Pages.

## File chính

- `index.html`: Trang chủ tĩnh.
- `404.html`: Bản dự phòng để GitHub Pages không hiện lỗi trắng.
- `assets/css/style.css`: CSS đã viết lại, không phụ thuộc WordPress admin bar hay PHP.
- `assets/js/main.js`: Menu mobile và tìm kiếm nội bộ theo tên/danh mục.
- `.nojekyll`: Tránh GitHub Pages xử lý Jekyll gây lỗi asset.

## Lưu ý

Ảnh trong code đang dùng link gốc từ `https://gamehaivl.com/wp-content/...`. Nếu muốn độc lập 100%, hãy tải ảnh về thư mục `assets/images/` rồi sửa lại đường dẫn ảnh trong `index.html`.
