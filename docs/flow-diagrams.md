# Sơ đồ quy trình nghiệp vụ Event Ticket Booking System

Tài liệu này tổng hợp các biểu đồ Activity và Sequence cho các quy trình chính của hệ thống, dựa trên các controller/service hiện có trong dự án.

## 1. Quy trình đặt vé

### Activity Diagram
```mermaid
flowchart TD
    A[Start] --> B[Chọn sự kiện]
    B --> C[Xem chi tiết sự kiện]
    C --> D[Chọn loại vé]
    D --> E[Nhập số lượng vé]
    E --> F{Còn vé và còn đủ 2 giờ trước khi diễn ra?}
    F -- No --> G[Thông báo không thể đặt vé]
    F -- Yes --> H[Tiến hành tạo booking]
    H --> I[Giảm availableTickets]
    I --> J[Đặt trạng thái RESERVED]
    J --> K[Phát sinh QR code]
    K --> L[Hiển thị thông tin đặt vé]
    L --> M[End]
    G --> M
```

### Sequence Diagram
```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as BookingController
    participant Svc as BookingServiceImpl
    participant Repo as Repository

    User->>FE: Chọn sự kiện, số lượng, loại vé
    FE->>API: POST /api/bookings
    API->>Svc: createBooking(userEmail, request)
    Svc->>Repo: find user, event, ticketType bằng lock
    Svc->>Repo: cập nhật availableTickets
    Svc->>Repo: lưu Booking(status = RESERVED)
    Svc->>Svc: tạo qrCodeValue
    Svc-->>API: BookingResponse
    API-->>FE: 201 Created
    FE-->>User: Hiển thị booking đã tạo
```

## 2. Quy trình thanh toán qua VNPay

### Activity Diagram
```mermaid
flowchart TD
    A[Start] --> B[Chọn booking ở trạng thái RESERVED]
    B --> C[Nhấn nút thanh toán]
    C --> D[Chuyển sang cổng VNPay]
    D --> E[Người dùng hoàn tất thanh toán]
    E --> F{Thanh toán thành công?}
    F -- Yes --> G[Cập nhật booking thành SOLD]
    G --> H[Gửi vé điện tử và QR]
    H --> I[Hiển thị xác nhận thanh toán]
    F -- No --> J[Hiển thị thông báo thanh toán thất bại]
    I --> K[End]
    J --> K
```

### Sequence Diagram
```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as BookingController
    participant Svc as BookingServiceImpl
    participant VNPay as VNPay Gateway
    participant Repo as Repository
    participant Mail as EmailService

    User->>FE: Bấm thanh toán
    FE->>API: POST /api/bookings/{id}/pay
    API->>Svc: createPaymentUrl(userEmail, bookingId, ip)
    Svc->>Svc: tạo params VNPay và chữ ký HMAC
    Svc-->>API: paymentUrl
    API-->>FE: paymentUrl
    FE->>VNPay: Redirect sang VNPay
    User->>VNPay: Hoàn tất thanh toán
    VNPay->>API: GET /api/bookings/payment-callback?bookingId=...&vnp_ResponseCode=00
    API->>Svc: handlePaymentCallback(params)
    Svc->>Repo: tìm booking
    Svc->>Repo: cập nhật status = SOLD
    Svc->>Mail: gửi vé điện tử
    Svc-->>API: true
    API-->>FE: redirect về frontend
```

## 3. Quy trình hoàn vé

### Activity Diagram
```mermaid
flowchart TD
    A[Start] --> B[Người dùng chọn vé đã thanh toán]
    B --> C[Yêu cầu hoàn vé]
    C --> D{Vé đang ở trạng thái SOLD?}
    D -- No --> E[Thông báo không thể hoàn vé]
    D -- Yes --> F{Sự kiện còn cách thời gian diễn ra hơn 1 ngày?}
    F -- No --> G[Thông báo không đủ điều kiện hoàn vé]
    F -- Yes --> H[Khôi phục vé vào kho]
    H --> I[Đổi trạng thái thành REFUNDED]
    I --> J[Gửi email xác nhận hoàn tiền]
    J --> K[Hiển thị kết quả hoàn vé]
    E --> L[End]
    G --> L
    K --> L
```

### Sequence Diagram
```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as BookingController
    participant Svc as BookingServiceImpl
    participant Repo as Repository
    participant Mail as EmailService

    User->>FE: Yêu cầu hoàn vé
    FE->>API: PUT /api/bookings/{id}/refund
    API->>Svc: refundBooking(userEmail, bookingId, reason)
    Svc->>Repo: tìm booking
    Svc->>Repo: kiểm tra status SOLD và thời gian sự kiện
    Svc->>Repo: cập nhật availableTickets
    Svc->>Repo: lưu booking(status = REFUNDED)
    Svc->>Mail: sendRefundEmail()
    Svc-->>API: BookingResponse
    API-->>FE: 200 OK
    FE-->>User: Thông báo hoàn vé thành công
```

## 4. Quy trình check-in QR

### Activity Diagram
```mermaid
flowchart TD
    A[Start] --> B[Admin mở chức năng check-in]
    B --> C[Upload ảnh QR của vé]
    C --> D[Giải mã mã QR từ ảnh]
    D --> E{Đọc được mã QR không?}
    E -- No --> F[Thông báo không đọc được QR]
    E -- Yes --> G[Tìm vé tương ứng trong hệ thống]
    G --> H{Vé hợp lệ, chưa check-in và đã thanh toán?}
    H -- No --> I[Thông báo vé không hợp lệ]
    H -- Yes --> J[Đánh dấu vé đã check-in]
    J --> K[Ghi thời gian và người check-in]
    K --> L[Hiển thị xác nhận check-in]
    F --> M[End]
    I --> M
    L --> M
```

### Sequence Diagram
```mermaid
sequenceDiagram
    actor Admin
    participant FE as Frontend
    participant API as BookingController
    participant Svc as BookingServiceImpl
    participant Repo as Repository

    Admin->>FE: Upload ảnh QR
    FE->>API: POST /api/bookings/check-in
    API->>Svc: checkInBooking(adminEmail, imageBytes)
    Svc->>Svc: decodeQrFromImage()
    Svc->>Repo: tìm booking theo qrCodeValue
    Svc->>Svc: kiểm tra trạng thái vé và check-in trước đó
    Svc->>Repo: lưu checkedIn=true, checkedInAt, checkedInBy
    Svc-->>API: CheckInResponse
    API-->>FE: 200 OK
    FE-->>Admin: Hiển thị kết quả check-in
```

## 5. Quy trình ChatBot AI

### Activity Diagram
```mermaid
flowchart TD
    A[Start] --> B[Người dùng nhập câu hỏi]
    B --> C[Hệ thống tìm thông tin sự kiện liên quan]
    C --> D{Có dữ liệu phù hợp và có cấu hình AI?}
    D -- Yes --> E[Tạo câu trả lời bằng AI]
    D -- No --> F[Dùng phản hồi mặc định từ hệ thống]
    E --> G[Hiển thị câu trả lời cho người dùng]
    F --> G
    G --> H[End]
```

### Sequence Diagram
```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as ChatController
    participant Svc as OpenAIChatService
    participant Repo as EventRepository
    participant AI as OpenAI/Gemini

    User->>FE: Nhập câu hỏi về sự kiện / vé
    FE->>API: POST /api/chat
    API->>Svc: ask(message)
    Svc->>Repo: lấy dữ liệu sự kiện liên quan
    alt Có API key cấu hình
        Svc->>AI: gửi prompt + context
        AI-->>Svc: câu trả lời AI
    else Không có API key
        Svc->>Svc: localFallback()
    end
    Svc-->>API: answer
    API-->>FE: ChatResponse
    FE-->>User: Hiển thị câu trả lời
```

## 6. Quy trình tự động giải phóng vé

### Activity Diagram
```mermaid
flowchart TD
    A[Start] --> B[Hệ thống kiểm tra booking còn ở trạng thái RESERVED]
    B --> C{Booking đã tồn tại quá 10 phút?}
    C -- No --> D[Kết thúc]
    C -- Yes --> E[Giải phóng vé trở lại kho]
    E --> F[Đổi trạng thái booking thành EXPIRED]
    F --> G[Lưu thay đổi vào hệ thống]
    G --> H[End]
```

### Sequence Diagram
```mermaid
sequenceDiagram
    participant Scheduler as Scheduled Task
    participant Svc as BookingServiceImpl
    participant Repo as Repository

    Scheduler->>Svc: releaseExpiredReservations()
    Svc->>Repo: tìm booking RESERVED cũ hơn cutoff
    loop Với mỗi booking hết hạn
        Svc->>Repo: tăng availableTickets event
        Svc->>Repo: tăng availableTickets ticketType
        Svc->>Repo: cập nhật booking status = EXPIRED
    end
    Svc-->>Scheduler: hoàn tất
```

## 7. Biểu đồ kiến trúc tổng thể hệ thống

```mermaid
flowchart TD
    U[User / Admin] --> B[Web Browser]
    B --> F[React + Vite Frontend]
    F --> A[REST API / HTTPS]

    A --> BE[Spring Boot Backend]

    BE --> C1[Controller]
    C1 --> C2[Service Layer]
    C2 --> C3[Repository / JPA]
    C3 --> DB[(MySQL Database)]

    BE --> VNPay[VNPay Payment Gateway]
    BE --> MAIL[SMTP Mail Service]
    BE --> AI[AI Service / OpenAI / Gemini]

    BE --> QR[QR Code Generator / Checker]
```

### Mô tả kiến trúc
- Frontend: React + Vite, giao diện người dùng cho xem sự kiện, đặt vé, thanh toán và quản lý vé.
- Backend: Spring Boot xử lý nghiệp vụ chính như đặt vé, thanh toán, hoàn vé, check-in QR và chatbot AI.
- Data layer: Spring Data JPA kết nối với MySQL để lưu sự kiện, booking, user, ticket type và trạng thái vé.
- Tích hợp bên ngoài:
  - VNPay: thanh toán tiền vé.
  - SMTP Mail: gửi vé điện tử và email hoàn tiền.
  - AI Service: chatbot hỗ trợ người dùng hỏi về sự kiện và vé.

## 8. Biểu đồ class UML

```mermaid
classDiagram
    class User {
        +Long id
        +String fullName
        +String email
        +String password
        +String phone
        +String cccd
        +Integer age
        +String gender
        +String avatarUrl
    }

    class Role {
        +Long id
        +String name
    }

    class Event {
        +Long id
        +String title
        +String description
        +String location
        +String imageUrl
        +LocalDateTime dateTime
        +BigDecimal price
        +Integer totalTickets
        +Integer availableTickets
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class TicketType {
        +Long id
        +String name
        +BigDecimal price
        +Integer totalTickets
        +Integer availableTickets
    }

    class Booking {
        +Long id
        +Integer quantity
        +BigDecimal totalPrice
        +BookingStatus status
        +String cancelReason
        +String refundReason
        +String qrCodeValue
        +boolean checkedIn
        +LocalDateTime checkedInAt
        +String checkedInBy
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class BookingStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        CANCELLED
        AVAILABLE
        RESERVED
        SOLD
        REFUNDED
        EXPIRED
    }

    class BookingController {
        +createBooking()
        +getMyBookings()
        +cancelBooking()
        +refundBooking()
        +createPaymentUrl()
        +checkInBooking()
    }

    class BookingServiceImpl {
        +createBooking()
        +cancelBooking()
        +refundBooking()
        +createPaymentUrl()
        +completePayment()
        +handlePaymentCallback()
        +checkInBooking()
        +releaseExpiredReservations()
    }

    class EmailServiceImpl {
        +sendTicketEmail()
        +sendRefundEmail()
    }

    class OpenAIChatService {
        +ask()
    }

    User --> Role : has
    Event --> TicketType : contains
    User --> Booking : makes
    Event --> Booking : has
    TicketType --> Booking : belongs to
    Booking --> BookingStatus : uses
    BookingController --> BookingServiceImpl : calls
    BookingServiceImpl --> EmailServiceImpl : uses
    BookingServiceImpl --> OpenAIChatService : not directly used
```

### Nhận xét về class diagram
- User và Role là lớp người dùng và vai trò phân quyền.
- Event và TicketType mô hình hóa sự kiện và các loại vé khác nhau.
- Booking là lớp trung tâm để quản lý trạng thái đặt vé, thanh toán và check-in.
- BookingServiceImpl là lớp xử lý nghiệp vụ chính cho các quy trình đặt vé, hoàn vé, thanh toán và QR.

## 9. Biểu đồ Package Diagram

```mermaid
flowchart TB
    subgraph ControllerLayer[controller]
        C1[AuthController]
        C2[EventController]
        C3[BookingController]
        C4[UserController]
        C5[AdminController]
        C6[ChatController]
    end

    subgraph ServiceLayer[service]
        S1[AuthService]
        S2[EventService]
        S3[BookingService]
        S4[UserService]
        S5[AdminStatsService]
        S6[EmailService]
        S7[OpenAIChatService]
    end

    subgraph RepositoryLayer[repository]
        R1[UserRepository]
        R2[EventRepository]
        R3[BookingRepository]
        R4[TicketTypeRepository]
        R5[RoleRepository]
    end

    subgraph ModelLayer[entity + dto]
        E1[entity]
        D1[dto]
    end

    subgraph SupportLayer[config / security / scheduler / exception / util]
        X1[config]
        X2[security]
        X3[scheduler]
        X4[exception]
        X5[util]
    end

    subgraph DataLayer[Database]
        DB[(MySQL Database)]
    end

    C1 --> S1
    C2 --> S2
    C3 --> S3
    C4 --> S4
    C5 --> S5
    C6 --> S7

    S1 --> R1
    S2 --> R2
    S3 --> R3
    S3 --> R4
    S4 --> R1
    S5 --> R3
    S7 --> R2

    S3 --> S6

    S1 --> E1
    S2 --> E1
    S3 --> E1
    S4 --> D1
    S5 --> D1

    C1 --> X2
    C3 --> X2
    C5 --> X2
    S1 --> X1
    S3 --> X3
    S3 --> X4
    S7 --> X5

    R1 --> DB
    R2 --> DB
    R3 --> DB
    R4 --> DB
    R5 --> DB
```

### Mô tả package diagram
- Package controller chứa các controller xử lý request từ frontend.
- Package service chứa logic nghiệp vụ chính như auth, event, booking, payment, refund và chatbot.
- Package repository là lớp truy cập dữ liệu với Spring Data JPA.
- Package entity và dto mô tả dữ liệu hệ thống và các object truyền giữa tầng.
- Package config, security, scheduler, exception, util là các thành phần hỗ trợ xuyên suốt hệ thống.

## 10. Mô hình kết nối Frontend và Backend

```mermaid
flowchart LR
    U[Người dùng] --> FE[React Frontend]
    FE --> AX[Axios / HTTP Client]
    AX --> API[REST API Spring Boot]
    API --> S[Service Layer]
    S --> R[Repository]
    R --> DB[(MySQL Database)]
    DB --> R
    R --> S
    S --> API
    API --> AX
    AX --> FE
    FE --> U
```

### Mô tả
- Người dùng tương tác với giao diện React trên frontend.
- Frontend sử dụng Axios để gửi các request HTTP đến REST API của Spring Boot.
- Backend xử lý nghiệp vụ ở tầng Service, truy vấn dữ liệu thông qua Repository và lưu trữ trong MySQL.
- Kết quả được trả ngược lại theo đúng chiều ngược của request.

## Ghi chú
- Đây là các luồng nghiệp vụ phù hợp với mã nguồn hiện tại của backend.
- Các trạng thái booking chính: RESERVED, SOLD, CANCELLED, EXPIRED, REFUNDED.
- QR code được sinh khi booking được tạo và dùng cho quy trình check-in.
