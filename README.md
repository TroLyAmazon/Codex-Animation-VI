# Codex Animation VI

Thêm một chút cá tính cho góc làm việc của bạn với **Codex Animation VI**: hoạt ảnh chào đón khi mở Codex, ảnh nền yêu thích và video chuyển động ngay trong cửa sổ làm việc.

Tiện ích dành cho **Codex / ChatGPT Desktop trên Windows x64**, có giao diện và hướng dẫn bằng tiếng Việt. Bạn có thể chọn GIF/video mở đầu, đổi nền và chỉnh lời chào ngay trong ứng dụng.

**Nếu thấy dự án hữu ích, hãy tặng repo một ⭐ Star nhé!** Sự ủng hộ của bạn là động lực để TroLyAmazon tiếp tục cải thiện và cập nhật các phiên bản sau. Cảm ơn bạn đã dùng thử và chia sẻ dự án ❤️

[⭐ Tặng một sao cho dự án](https://github.com/TroLyAmazon/Codex-Animation-VI) · [📥 Tải bản mới nhất](https://github.com/TroLyAmazon/Codex-Animation-VI/releases/latest) · [🐛 Báo lỗi / góp ý](https://github.com/TroLyAmazon/Codex-Animation-VI/issues)

Đây là tiện ích không chính thức, không trực thuộc hoặc được OpenAI bảo trợ. Bản Windows và phần Việt hóa được phát triển từ [panding999/codex-startup-animation](https://github.com/panding999/codex-startup-animation).

## Tính năng

- Hoạt ảnh mở đầu bằng GIF, MP4 hoặc WebM; có thể chuyển về hiệu ứng nét vẽ.
- Nền làm việc bằng ảnh tĩnh, GIF hoặc video phát lặp không tiếng.
- Đổi ảnh đại diện, lời chào, phụ đề và độ rõ nền.
- Bỏ qua hoạt ảnh bằng **Esc**; khôi phục giao diện gốc trong bảng cài đặt.
- Bộ cài có **Install**, **Reinstall**, **Uninstall** và tạo lối tắt **Codex Animation**.
- Ảnh, video và tùy chỉnh lưu trên máy, không có chức năng tải tài nguyên cá nhân lên mạng.

## Yêu cầu

- Windows x64, có Windows PowerShell và .NET Framework 4.x.
- Đã cài ứng dụng Codex / ChatGPT Desktop chính thức từ Microsoft Store; chỉ cài Codex CLI là chưa đủ.
- Bộ cài đóng kèm Node.js 22 nên người dùng không cần cài Node.js riêng.

Đã kiểm tra trên máy phát triển với Codex `26.1027.3384.0`. Phiên bản giao diện khác có thể cần điều chỉnh.

## Cài đặt và mở ứng dụng

1. Lấy `Codex Animation Setup.exe` từ bản phát hành do người duy trì cung cấp. Kiểm tra [Releases](https://github.com/TroLyAmazon/Codex-Animation-VI/releases) nếu đã có bản tải; **Code → Download ZIP** chỉ tải mã nguồn.
2. Mở bộ cài. **Install** chỉ hiện khi chưa phát hiện bản cài. **Reinstall** và **Uninstall** luôn hiện nhưng chỉ dùng được khi đã cài.
3. Nhấn **Install**. Ứng dụng được cài cho tài khoản hiện tại vào `%LOCALAPPDATA%\CodexAnimationVN`, không cần quyền quản trị.
4. Lưu công việc và thoát hoàn toàn Codex, kể cả tiến trình dưới khay hệ thống nếu có.
5. Mở **Codex Animation** trên Desktop hoặc Start Menu.

Mở trực tiếp biểu tượng Codex chính thức sẽ không tự nạp tiện ích. Launcher không tự đóng một phiên Codex đang chạy nếu phiên đó chưa có cổng kết nối phù hợp.

### Cài lại hoặc gỡ

- **Reinstall**: cài lại/cập nhật tệp và tạo lại lối tắt; giữ tùy chỉnh đã lưu trong Codex.
- **Uninstall**: gỡ tệp tiện ích và lối tắt của bản cài; giữ ứng dụng Codex chính thức cùng dữ liệu trò chuyện.
- Có thể gỡ từ phần ứng dụng đã cài của Windows hoặc mở lại bộ cài.
- Gỡ tiện ích không tự đóng phiên Codex đang chạy. Thoát hoàn toàn rồi mở bằng biểu tượng chính thức để bỏ lớp giao diện hiện tại.

## Đổi hoạt ảnh mở đầu

1. Trong Codex, nhấn **Ảnh nền** ở góc dưới bên phải.
2. Tại **Hoạt ảnh mở đầu**, nhấn **Chọn GIF / video mở đầu**.
3. Chọn GIF, MP4 hoặc WebM rồi nhấn **Lưu và xem thử**.

Video mở đầu phát một lần, không tiếng, dài tối đa **60 giây**. GIF phát trong **12 giây**. Tệp động tối đa **50 MB**. Nên dùng MP4 mã hóa H.264 hoặc WebM mà Chromium hỗ trợ.

Muốn dùng nét vẽ, nhấn **Chuyển sang hiệu ứng nét vẽ**. Phần ảnh đại diện và lời chào sẽ hiện để chỉnh sửa. Chế độ GIF/video phát nguyên nội dung của tệp, không chèn lời chào của chế độ nét vẽ.

## Đổi nền sau hoạt ảnh

1. Mở **Ảnh nền**, tìm **Nền sau hoạt ảnh**.
2. Nhấn **Đổi nền / GIF / video**.
3. Chọn ảnh PNG/JPEG/WebP, GIF hoặc MP4/WebM.
4. Chỉnh **Độ rõ ảnh nền Codex** rồi nhấn **Lưu và xem thử**.

Nền video phát lặp, không tiếng; tạm dừng khi cửa sổ bị ẩn hoặc mở bảng cài đặt. Ảnh tĩnh tối đa **30 MB**; GIF/video tối đa **50 MB**. Kéo độ rõ về **0%** để ẩn nền. Nền động dùng nhiều tài nguyên hơn ảnh tĩnh.

Nhấn **×** hoặc **Esc** để bỏ thay đổi chưa lưu. Nút **Tắt hoạt ảnh và khôi phục giao diện Codex** ở cuối bảng gỡ lớp giao diện trong phiên hiện tại. `Ctrl+Alt+B` cũng được đăng ký để mở cài đặt nhưng có thể xung đột phím hệ thống; nên dùng nút **Ảnh nền**.

## Video mặc định của bản build

Bản build hiện dùng hai tệp do người duy trì chuẩn bị:

```text
video/
├── Start/codex_edited.mp4
└── wallpaper/girl_only_dark_blue_wallpaper.mp4
```

Lần đầu nạp bộ mặc định phiên bản này, tiện ích áp dụng hai video trên. Các lần sau giữ lựa chọn đã lưu. Hai video được đóng kèm trong kho mã, không cần tải riêng.

## Build từ mã nguồn

1. Tải hoặc clone kho mã lên Windows x64.
2. Giữ nguyên thư mục `video` và hai video mặc định đi kèm.
3. Trong thư mục gốc, chạy:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\build.ps1
```

Script dùng trình biên dịch .NET Framework của Windows, tải Node.js 22 từ `nodejs.org`, kiểm tra SHA256 và đóng gói runtime cùng hai video. Cần mạng khi build. Kết quả:

```text
dist/Codex Animation Setup.exe
```

`.build/`, `dist/` và `build-exe.bat` không được đưa vào Git. Hai video mặc định trong `video/` được đưa vào kho. Chỉ gửi bộ cài `.exe` cho người dùng cuối; không cần gửi mã nguồn hoặc thư mục build.

## Cách tích hợp và xử lý lỗi

Tiện ích xác minh chữ ký OpenAI, mở hoặc kết nối cổng gỡ lỗi tại `127.0.0.1`, kiểm tra tiến trình sở hữu cổng rồi nạp lớp hoạt ảnh vào cửa sổ chính. Giữ nguyên gói cài đặt chính thức.

Cổng gỡ lỗi tồn tại trong suốt phiên Codex và các tiến trình khác trên máy có thể truy cập. Muốn đóng cổng: thoát hoàn toàn Codex rồi mở lại bằng biểu tượng chính thức.

| Hiện tượng | Cách xử lý |
| --- | --- |
| Mở Codex nhưng không có hoạt ảnh | Dùng lối tắt **Codex Animation**. |
| Báo phiên Codex chưa có cổng kết nối | Lưu công việc, thoát hoàn toàn rồi mở bằng lối tắt tiện ích. |
| Không phát được video | Thử MP4 H.264 hoặc WebM khác, kiểm tra dung lượng và thời lượng. |
| Nền khó đọc | Giảm độ rõ nền hoặc chọn nền tối hơn. |
| Mất/thiếu tệp tiện ích | Mở bộ cài và chọn **Reinstall**. |
| Lỗi sau khi Codex cập nhật | Thử khởi động lại; phiên bản mới có thể cần sửa bộ tích hợp. |

Nhật ký launcher ở `%LOCALAPPDATA%\CodexAnimationVN\.build\windows\launcher.log`. Bộ cài cá nhân chưa có chữ ký số.

## Nguồn tham khảo và quyền sử dụng

Xem [nguồn tham khảo](docs/references.md). Dự án gốc chưa chỉ định giấy phép mã nguồn tại thời điểm lấy mã; việc công khai kho này không tự cấp thêm giấy phép cho mã hoặc tài nguyên của bên thứ ba. Không coi ảnh/video đi kèm các bản build là tài nguyên được tự do phân phối lại.
