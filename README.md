# 🎓 EnglishGo – English Learning & Practice Mobile Application

> **Đồ án môn học:** Lập trình Thiết bị Di động (Mobile Application Development)  
> **Nhóm phát triển:** 2 sinh viên  
> **Thời gian thực hiện:** 3 tuần  
> **Nền tảng:** React Native (Expo) & Node.js Express RESTful API  

---

## 📱 1. Giới thiệu Dự án

**EnglishGo** là ứng dụng di động hỗ trợ sinh viên học và rèn luyện tiếng Anh toàn diện qua 4 kỹ năng cơ bản (Nghe, Nói/Viết qua trợ lý AI, Đọc, Từ vựng & Ngữ pháp) kết hợp phương pháp lặp lại ngắt quãng (Spaced Repetition) với Flashcard 3D và thử thách tính giờ hàng ngày (Daily Challenge).

### Điểm nổi bật cho buổi bảo vệ đồ án:
1. **Dữ liệu thật 100% qua API:** Không hardcode dữ liệu tĩnh; toàn bộ tiến độ từ vựng, điểm thi quiz, chuỗi học tập (streak) và bài nghe đều đồng bộ thời gian thực với backend SQLite.
2. **Flashcard lật 3D mượt mà:** Xây dựng bằng `react-native-reanimated`, xử lý mượt mà trên cả iOS lẫn Android.
3. **Trợ lý AI Writing Assistant đa tầng:** Có cơ chế **AI Failover Engine** (kết nối Gemini LLM khi có internet/key, tự động chuyển sang bộ phân tích Rule-based Pedagogical Engine nếu ngoại tuyến), đảm bảo demo trước hội đồng không bao giờ crash.
4. **Hỗ trợ thiết bị thật (Physical Device):** Có tính năng đổi IP Server trực tiếp ngay trên giao diện ứng dụng để giảng viên quét mã QR chấm điểm trên điện thoại cá nhân.

---

## 🛠 2. Công nghệ Sử dụng

### Frontend (Mobile App)
- **Framework:** React Native with TypeScript (Expo SDK 58).
- **Navigation:** Expo Router (File-based Routing).
- **State Management & Caching:** TanStack Query v5 (`@tanstack/react-query`).
- **HTTP Client:** Axios với Request/Response Interceptors tự động gắn JWT Token và trích xuất lỗi.
- **Form Handling:** React Hook Form + Zod Schema Validation.
- **Animations:** React Native Reanimated (Lật thẻ 3D, thanh tiến độ động).
- **Audio:** `expo-av` phát audio phát âm từ vựng và bài thi Listening.
- **Storage:** `@react-native-async-storage/async-storage` lưu trữ JWT Token và tùy biến IP Backend.

### Backend (RESTful API)
- **Runtime & Framework:** Node.js + Express.js (TypeScript).
- **Database:** SQLite (chạy nhẹ nhàng, lưu trữ tập trung tại `englishgo.db`, không cần cài đặt SQL Server/MySQL nặng nề).
- **Security:** `bcryptjs` băm mật khẩu, `jsonwebtoken` (JWT) xác thực người dùng.
- **AI Integration:** Google Gemini API kết hợp Fallback Local Engine.

---

## 📂 3. Cấu trúc Thư mục Dự án

```text
EnglishLearningApp/
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx              # Root Layout: Provider bọc toàn app (Auth, Query, Theme)
│   │   ├── (auth)/
│   │   │   ├── login.tsx            # Đăng nhập (hỗ trợ nút điền nhanh tài khoản demo)
│   │   │   ├── register.tsx         # Đăng ký tài khoản mới
│   │   │   └── forgot-password.tsx  # Quên mật khẩu
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # Bottom Tab Navigator (4 Tabs chính)
│   │   │   ├── index.tsx            # Home Dashboard (Chào hỏi, Streak, Word of the Day)
│   │   │   ├── learn.tsx            # Learning Hub (Tổng hợp 5 phân hệ học)
│   │   │   ├── progress.tsx         # Báo cáo thống kê & Biểu đồ học tập 7 ngày
│   │   │   └── profile.tsx          # Trang cá nhân, đổi mục tiêu học & cấu hình IP
│   │   ├── vocabulary/
│   │   │   └── [topicId].tsx        # Thẻ Flashcard học từ vựng 3D (phát âm, yêu thích, đã học)
│   │   ├── grammar/
│   │   │   └── [lessonId].tsx       # Bài học ngữ pháp Markdown & bài tập trắc nghiệm
│   │   ├── listening/
│   │   │   └── [id].tsx             # Trình phát Audio nghe & bài trắc nghiệm hiểu
│   │   ├── reading/
│   │   │   └── [id].tsx             # Đọc hiểu đoạn văn tiếng Anh
│   │   ├── quiz/
│   │   │   ├── index.tsx            # Danh sách đề thi Quiz & Thử thách hàng ngày
│   │   │   ├── [id].tsx             # Màn hình làm bài thi có đồng hồ đếm ngược
│   │   │   └── result.tsx           # Kết quả thi, tính điểm & giải thích từng câu
│   │   └── ai-assistant/
│   │       └── index.tsx            # Trợ lý AI sửa lỗi ngữ pháp & gợi ý từ vựng
│   ├── context/
│   │   └── AuthContext.tsx          # Quản lý trạng thái đăng nhập toàn cục
│   ├── services/                    # Tầng API Service tách biệt logic UI
│   ├── constants/                   # Bảng màu Indigo chuẩn sư phạm & Config
│   └── types/                       # Khai báo TypeScript types dùng chung
│
├── backend/
│   ├── src/
│   │   ├── config/                  # Cấu hình biến môi trường & Port
│   │   ├── controllers/             # Logic điều hướng từng phân hệ API
│   │   ├── database/
│   │   │   ├── db.ts                # Wrapper SQLite Async Promise
│   │   │   ├── schema.ts            # Khởi tạo bảng cơ sở dữ liệu
│   │   │   └── seed.ts              # Script nạp dữ liệu mẫu sinh viên phong phú
│   │   ├── middleware/              # JWT Auth & Error Handler
│   │   ├── routes/                  # Định tuyến REST endpoints
│   │   └── server.ts                # Khởi động Express & in IP mạng LAN
│   └── package.json
└── README.md
```

---

## 🚀 4. Hướng dẫn Cài đặt & Chạy Thử nghiệm

### Bước 1: Khởi động Backend & Nạp Dữ liệu Mẫu

Mở một cửa sổ Terminal (PowerShell / Command Prompt):

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện (nếu chưa cài)
npm install

# 3. Nạp dữ liệu mẫu vào SQLite (từ vựng, ngữ pháp, bài nghe, quiz, user demo)
npm run seed

# 4. Khởi chạy Backend Server
npm run dev
```

> **Lưu ý trên Terminal Backend:**  
> Backend sẽ hiển thị 2 địa chỉ:
> - `Local machine access: http://localhost:5000/api/health`
> - `Physical Phone LAN access: http://192.168.x.x:5000/api` (Dùng địa chỉ này khi chạy app trên điện thoại thật cùng mạng WiFi).

---

### Bước 2: Khởi động Mobile App (Frontend)

Mở một cửa sổ Terminal thứ hai:

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện
npm install

# 3. Khởi chạy Expo Dev Server
npx expo start
```

### Bước 3: Xem Ứng dụng
- **Trên điện thoại thật (Khuyên dùng khi bảo vệ):** Cài app **Expo Go** từ App Store / Google Play, mở camera quét mã QR hiển thị trên Terminal.
- **Trên Android Emulator:** Bấm phím `a`.
- **Trên trình duyệt Web (Test nhanh UI):** Bấm phím `w`.

---

## 🔑 5. Tài khoản Demo Có Sẵn

Nhóm đã chuẩn bị sẵn tài khoản demo có lịch sử học tập 5 ngày streak:
- **Email:** `student@englishgo.edu.vn`
- **Mật khẩu:** `student123`
*(Trên màn hình Đăng nhập có sẵn nút **"Quick Fill Demo Account"** để điền ngay lập tức).*

---

## 📋 6. Danh sách RESTful API Endpoints

| Nhóm | Method | Endpoint | Mô tả |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản sinh viên |
| | `POST` | `/api/auth/login` | Đăng nhập nhận JWT Token & cập nhật Streak |
| | `GET` | `/api/auth/me` | Lấy thông tin user hiện tại |
| **Vocabulary** | `GET` | `/api/vocabulary/topics` | Danh sách chủ đề và tiến độ học |
| | `GET` | `/api/vocabulary/topic/:id` | Danh sách từ vựng trong chủ đề |
| | `POST` | `/api/vocabulary/:id/favorite` | Thêm / bỏ từ yêu thích |
| | `POST` | `/api/vocabulary/:id/progress` | Đánh dấu từ đã thuộc |
| **Grammar** | `GET` | `/api/grammar/lessons` | Danh sách bài học ngữ pháp |
| | `GET` | `/api/grammar/lesson/:id` | Chi tiết lý thuyết & câu hỏi trắc nghiệm |
| | `POST` | `/api/grammar/lesson/:id/submit` | Nộp điểm bài tập ngữ pháp |
| **Listening** | `GET` | `/api/listening/exercises` | Danh sách bài nghe |
| | `GET` | `/api/listening/exercise/:id` | Audio URL, transcript & câu hỏi hiểu |
| **Reading** | `GET` | `/api/reading/passages` | Danh sách bài đọc hiểu |
| | `GET` | `/api/reading/passage/:id` | Nội dung bài đọc & câu hỏi |
| **Quiz** | `GET` | `/api/quiz/all` | Danh sách đề thi & Daily Challenge |
| | `GET` | `/api/quiz/:id` | Lấy đề thi |
| | `POST` | `/api/quiz/:id/submit` | Nộp bài thi, tính điểm & lưu lịch sử |
| **AI Tutor** | `POST` | `/api/ai/correct-writing` | Sửa ngữ pháp, chấm điểm & gợi ý từ vựng |
| **User & Stats**| `GET` | `/api/users/statistics` | Thống kê số từ, % đúng và biểu đồ tuần |
| | `PUT` | `/api/users/profile` | Đổi mục tiêu học tập (phút/ngày) |

---

## 👥 7. Phân công Công việc Nhóm (2 Sinh viên)

| Thành viên | Trách nhiệm chính | Chi tiết hoàn thành |
| :--- | :--- | :--- |
| **Sinh viên 1 (Frontend Lead)** | Thiết kế UI/UX & Tương tác Mobile | Xây dựng 15 màn hình Expo Router, xử lý Animation lật thẻ 3D, tích hợp TanStack Query, Audio Player và Form Validation |
| **Sinh viên 2 (Backend & AI Lead)** | Thiết kế API & Cơ sở dữ liệu | Thiết kế SQLite Schema, RESTful API với Express, mã hóa mật khẩu JWT, cơ chế Failover AI Assistant và tính toán thống kê Streak |

---

## 🎓 8. Cẩm nang Trả lời Câu hỏi Phản biện (Defense Q&A Guide)

1. **Giảng viên hỏi:** *"Tại sao các em dùng TanStack Query thay vì Redux Toolkit?"*  
   - **Trả lời:** TanStack Query chuyên biệt cho **Server-State Management**. Trong một ứng dụng học tập, 90% dữ liệu (từ vựng, điểm số, bài đọc) đến từ Backend. TanStack Query tự động quản lý Caching, Deduplication, tự động invalidate dữ liệu khi nộp bài mà không cần viết hàng trăm dòng code Boilerplate Reducer/Thunk. Với Local State (như trạng thái đăng nhập), nhóm dùng React Context kết hợp AsyncStorage là vừa đủ gọn gàng và tối ưu hiệu năng.

2. **Giảng viên hỏi:** *"Làm thế nào để ứng dụng chạy mượt mà trên điện thoại thật mà không bị gián đoạn kết nối Backend?"*  
   - **Trả lời:** Nhóm cấu hình Axios Interceptor tự động đọc IP cấu hình từ `AsyncStorage`. Trong trang Profile/Settings, người dùng có thể nhập trực tiếp địa chỉ IP mạng nội bộ của máy chủ backend. Đồng thời, các request API đều có timeout 10 giây và cơ chế xử lý lỗi mạng rõ ràng trên giao diện.

3. **Giảng viên hỏi:** *"Tính năng AI hoạt động ra sao nếu trường học không có internet hoặc API bị quá tải?"*  
   - **Trả lời:** Backend được thiết kế theo kiến trúc **AI Failover Engine**. Nếu kết nối LLM thất bại sau 6 giây hoặc không có API Key, hệ thống tự động kích hoạt **Pedagogical Rule-based Engine** phân tích lỗi ngữ pháp phổ biến (chia động từ, mạo từ, chính tả) và trả về cấu trúc JSON chuẩn xác để giao diện hiển thị liền mạch.

