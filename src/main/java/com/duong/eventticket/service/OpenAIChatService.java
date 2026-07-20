package com.duong.eventticket.service;

import com.duong.eventticket.entity.Event;
import com.duong.eventticket.repository.EventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class OpenAIChatService {
    private final EventRepository eventRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${chat.provider:gemini}")
    private String chatProvider;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-3.5-flash}")
    private String geminiModel;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    public String ask(String userMessage) {
        if (userMessage == null || userMessage.trim().isBlank()) {
            return "Xin hãy nhập câu hỏi để chatbot trả lời.";
        }

        String directAnswer = buildDirectAnswer(userMessage);
        if (directAnswer != null) {
            return directAnswer;
        }

        String dataContext = buildRelevantEventContext(userMessage);

        if ("openai".equalsIgnoreCase(chatProvider) && openAiApiKey != null && !openAiApiKey.isBlank()) {
            return askOpenAI(userMessage, dataContext);
        }

        if ("gemini".equalsIgnoreCase(chatProvider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
            return askGemini(userMessage, dataContext);
        }

        return localFallback(userMessage, dataContext);
    }

    private static final String PROJECT_SYSTEM_PROMPT = "Bạn là một trợ lý AI thông minh cho ứng dụng Event Ticket Booking System. " +
            "Trả lời bằng tiếng Việt tự nhiên, thân thiện và linh hoạt. " +
            "Hiểu được câu hỏi có nhiều phần, điều kiện, phủ định và yêu cầu phức tạp. " +
            "Luôn sử dụng dữ liệu hệ thống hiện tại được cung cấp trong prompt để trả lời các câu hỏi về sự kiện, vé, địa điểm, giá và quy trình đặt vé. " +
            "Nếu người dùng hỏi về thông tin sự kiện cụ thể, trả lời thẳng vào nội dung đó trước rồi giải thích ngắn gọn nếu cần. " +
            "Nếu không tìm thấy dữ liệu chính xác trong hệ thống, hãy nói rõ ràng rằng sự kiện chưa có trong hệ thống và không suy đoán. " +
            "Đừng trả lời chung chung, đừng dùng kiểu văn bản giống prompt kỹ thuật. " +
            "Chỉ dựa trên tính năng của hệ thống này: quản lý sự kiện, tìm kiếm sự kiện, đặt vé, thanh toán VNPay, trạng thái vé AVAILABLE/RESERVED/SOLD, và hồ sơ người dùng. " +
            "Nếu câu hỏi không liên quan, trả lời rằng bạn chỉ hỗ trợ thông tin dự án này.";

    private List<Map<String, Object>> buildChatMessages(String userMessage, String dataContext) {
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", PROJECT_SYSTEM_PROMPT);

        String userContent = userMessage;
        if (dataContext != null && !dataContext.isBlank()) {
            userContent = "Dữ liệu hiện tại của hệ thống:\n" + dataContext + "\n\n" + userMessage;
        }

        Map<String, Object> userMessageMap = new HashMap<>();
        userMessageMap.put("role", "user");
        userMessageMap.put("content", userContent);

        return List.of(systemMessage, userMessageMap);
    }

    private String buildRelevantEventContext(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return null;
        }

        List<Event> relevantEvents = findRelevantEvents(userMessage);
        if (!relevantEvents.isEmpty()) {
            return "Các sự kiện phù hợp với truy vấn của bạn:\n" + buildEventFacts(relevantEvents);
        }

        String normalized = userMessage.toLowerCase();
        boolean eventRelated = normalized.contains("vé")
                || normalized.contains("sự kiện")
                || normalized.contains("event")
                || normalized.contains("ticket")
                || normalized.contains("giá")
                || normalized.contains("địa điểm")
                || normalized.contains("ở đâu")
                || normalized.contains("thời gian")
                || normalized.contains("còn lại")
                || normalized.contains("còn")
                || normalized.contains("mua vé")
                || normalized.contains("đặt vé");

        if (eventRelated) {
            List<Event> events = eventRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.ASC, "dateTime"))).getContent();
            if (!events.isEmpty()) {
                return "Dưới đây là một số sự kiện hiện có trong hệ thống:\n" + buildEventFacts(events);
            }
        }

        return null;
    }

    private List<Event> findRelevantEvents(String userMessage) {
        String normalized = userMessage.toLowerCase();

        if (containsAny(normalized, "rẻ nhất", "giá thấp nhất", "cheap", "giá thấp")) {
            Optional<Event> cheapest = eventRepository.findFirstByAvailableTicketsGreaterThanOrderByPriceAsc(0);
            return cheapest.map(List::of).orElse(List.of());
        }

        if (containsAny(normalized, "muộn nhất", "gần nhất", "thời gian muộn", "thời gian gần")) {
            Optional<Event> latestEvent = eventRepository.findFirstByOrderByDateTimeDesc();
            return latestEvent.map(List::of).orElse(List.of());
        }

        if (containsAny(normalized, "nhiều vé", "còn lại nhiều", "còn nhiều", "tổng vé")) {
            Optional<Event> largest = eventRepository.findFirstByAvailableTicketsGreaterThanOrderByAvailableTicketsDesc(0);
            return largest.map(List::of).orElse(List.of());
        }

        Optional<Event> matchedEvent = findEventFromQuestion(userMessage);
        if (matchedEvent.isPresent()) {
            return List.of(matchedEvent.get());
        }

        List<Event> events = eventRepository.findTop5ByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(userMessage, userMessage);
        if (!events.isEmpty()) {
            return events;
        }

        return List.of();
    }

    private String buildEventFacts(List<Event> events) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        StringBuilder builder = new StringBuilder();
        for (Event event : events) {
            if (builder.length() > 0) {
                builder.append("\n");
            }
            builder.append("- ")
                    .append(event.getTitle())
                    .append(" | Địa điểm: ")
                    .append(event.getLocation())
                    .append(" | Thời gian: ")
                    .append(event.getDateTime().format(formatter))
                    .append(" | Giá vé: ")
                    .append(event.getPrice())
                    .append(" VNĐ")
                    .append(" | Vé trống: ")
                    .append(event.getAvailableTickets());
        }
        return builder.toString();
    }

    private static final Pattern PRICE_RANGE_PATTERN = Pattern.compile("(?i)(dưới|thấp hơn|trên|lớn hơn|>)\\s*(\\d+[.,]?\\d*)(k|000)?");
    private static final Pattern TOTAL_PRICE_PATTERN = Pattern.compile("(?i)^(\\d+)\\s*(?:vé|ticket)s?\\s+(.+?)\\s*(?:có tổng giá bao nhiêu|tổng giá bao nhiêu|giá bao nhiêu|bao nhiêu tiền|cần trả bao nhiêu|giá|có giá|là bao nhiêu)\\s*\\?*$");

    private String buildDirectAnswer(String userMessage) {
        String normalized = userMessage.toLowerCase().trim();

        Matcher totalPriceMatcher = TOTAL_PRICE_PATTERN.matcher(normalized);
        if (totalPriceMatcher.find()) {
            int quantity = Integer.parseInt(totalPriceMatcher.group(1));
            String eventQuery = totalPriceMatcher.group(2).trim();
            Optional<Event> exactEvent = findEventFromQuestion(eventQuery);
            if (exactEvent.isPresent()) {
                Event event = exactEvent.get();
                return "Tổng giá cho " + quantity + " vé của sự kiện '" + event.getTitle() + "' là " +
                        event.getPrice().multiply(BigDecimal.valueOf(quantity)).toPlainString() + " VNĐ.";
            }
            return "Hiện tại hệ thống không tìm thấy sự kiện phù hợp với tên hoặc địa điểm này.";
        }

        if (containsAny(normalized, "vé có giá rẻ nhất", "vé rẻ nhất", "giá rẻ nhất", "giá thấp nhất")) {
            Optional<Event> cheapest = eventRepository.findFirstByAvailableTicketsGreaterThanOrderByPriceAsc(0);
            if (cheapest.isPresent()) {
                Event event = cheapest.get();
                return "Vé rẻ nhất hiện có trong hệ thống là sự kiện '" + event.getTitle() + "' tại " + event.getLocation() + ", " +
                        "diễn ra vào " + event.getDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ", " +
                        "giá " + event.getPrice() + " VNĐ, còn " + event.getAvailableTickets() + " vé trống.";
            }
            return "Hiện tại không có vé AVAILABLE trong hệ thống để trả lời câu hỏi về vé rẻ nhất.";
        }

        if (containsAny(normalized, "vé nào đã đóng bán", "đã đóng bán", " đóng bán", "sold out", "hết vé", "hết bán", "đóng bán", "bán hết")) {
            Optional<Event> exactEvent = findEventFromQuestion(userMessage);
            if (exactEvent.isPresent()) {
                Event event = exactEvent.get();
                if (event.getAvailableTickets() != null && event.getAvailableTickets() == 0) {
                    return "Sự kiện '" + event.getTitle() + "' đã đóng bán vì đã hết vé.";
                }
                if (isEventSaleClosedByTime(event)) {
                    return "Sự kiện '" + event.getTitle() + "' đã đóng bán vì chỉ còn dưới 2 tiếng trước giờ tổ chức.";
                }
                return "Sự kiện '" + event.getTitle() + "' vẫn đang mở bán và hiện còn " + event.getAvailableTickets() + " vé AVAILABLE.";
            }

            List<Event> soldOutEvents = eventRepository.findByAvailableTicketsEquals(0);
            List<Event> timeClosedEvents = eventRepository.findAll().stream()
                    .filter(this::isEventSaleClosedByTime)
                    .toList();

            if (!soldOutEvents.isEmpty() || !timeClosedEvents.isEmpty()) {
                StringBuilder builder = new StringBuilder();
                if (!soldOutEvents.isEmpty()) {
                    builder.append("Các sự kiện đã đóng bán vì hết vé:\n").append(buildEventFacts(soldOutEvents)).append("\n");
                }
                if (!timeClosedEvents.isEmpty()) {
                    builder.append("Các sự kiện đã đóng bán vì còn dưới 2 tiếng trước giờ tổ chức:\n").append(buildEventFacts(timeClosedEvents));
                }
                return builder.toString().trim();
            }
            return "Hiện tại hệ thống không ghi nhận sự kiện nào đã đóng bán (hết vé/SOLD OUT hoặc đã đến ngưỡng đóng bán 2 tiếng trước giờ tổ chức).";
        }

        if (containsAny(normalized, "khi nào", "bao giờ", "tổ chức khi nào", "diễn ra khi nào", "thời gian") && !containsAny(normalized, "giá", "bao nhiêu", "tiền", "còn vé")) {
            Optional<Event> exactEvent = findEventFromQuestion(userMessage);
            if (exactEvent.isPresent()) {
                Event event = exactEvent.get();
                return "Sự kiện '" + event.getTitle() + "' sẽ diễn ra vào " + event.getDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ".";
            }
            return "Hiện tại hệ thống không tìm thấy sự kiện phù hợp để trả lời câu hỏi về thời gian tổ chức.";
        }

        Matcher matcher = PRICE_RANGE_PATTERN.matcher(normalized);
        if (matcher.find()) {
            String operator = matcher.group(1).toLowerCase();
            String numberText = matcher.group(2).replaceAll("[.,]", "");
            String suffix = matcher.group(3);
            BigDecimal threshold = new BigDecimal(numberText);
            if (suffix != null && suffix.equalsIgnoreCase("k")) {
                threshold = threshold.multiply(BigDecimal.valueOf(1000));
            }

            if (operator.contains("dưới") || operator.contains("thấp hơn") || operator.equals("<")) {
                List<Event> cheapEvents = eventRepository.findTop5ByPriceLessThanEqualAndAvailableTicketsGreaterThanOrderByPriceAsc(threshold, 0);
                if (!cheapEvents.isEmpty()) {
                    StringBuilder builder = new StringBuilder();
                    builder.append("Các sự kiện có vé giá dưới hoặc bằng ").append(threshold).append(" VNĐ còn AVAILABLE:\n");
                    for (Event event : cheapEvents) {
                        builder.append("- ").append(event.getTitle())
                                .append(" | Địa điểm: ").append(event.getLocation())
                                .append(" | Giá: ").append(event.getPrice()).append(" VNĐ")
                                .append(" | Còn: ").append(event.getAvailableTickets()).append(" vé\n");
                    }
                    return builder.toString().trim();
                }
                return "Hiện tại không có sự kiện nào trong hệ thống với vé giá dưới hoặc bằng " + threshold + " VNĐ còn AVAILABLE.";
            }

            if (operator.contains("trên") || operator.contains("lớn hơn") || operator.equals(">")) {
                List<Event> expensiveEvents = eventRepository.findTop5ByPriceGreaterThanAndAvailableTicketsGreaterThanOrderByPriceAsc(threshold, 0);
                if (!expensiveEvents.isEmpty()) {
                    StringBuilder builder = new StringBuilder();
                    builder.append("Các sự kiện có vé giá trên ").append(threshold).append(" VNĐ còn AVAILABLE:\n");
                    for (Event event : expensiveEvents) {
                        builder.append("- ").append(event.getTitle())
                                .append(" | Địa điểm: ").append(event.getLocation())
                                .append(" | Giá: ").append(event.getPrice()).append(" VNĐ")
                                .append(" | Còn: ").append(event.getAvailableTickets()).append(" vé\n");
                    }
                    return builder.toString().trim();
                }
                return "Hiện tại không có sự kiện nào có giá vé trên " + threshold + " VNĐ và còn AVAILABLE.";
            }
        }

        if (containsAny(normalized, "quy trình đặt vé", "cách đặt vé", "hướng dẫn đặt vé", "đặt vé như thế nào", "cách mua vé", "quy trình đặt", "hướng dẫn mua vé")) {
            return "Quy trình đặt vé trên hệ thống gồm:\n" +
                    "1. Chọn sự kiện bạn muốn tham gia.\n" +
                    "2. Chọn số lượng vé và nhấn 'Đặt vé'.\n" +
                    "3. Thanh toán qua VNPay trong vòng 10 phút để xác nhận đơn hàng.\n" +
                    "4. Kiểm tra trạng thái vé trong trang 'Vé của tôi'.";
        }

        if (normalized.contains("giá") && containsAny(normalized, "giá bao nhiêu", "có giá bao nhiêu", "giá của", "giá là bao nhiêu", "bao nhiêu tiền", "có giá", "giá mỗi")
                && !containsAny(normalized, "dưới", "thấp hơn", "<", "trên", ">")) {
            Optional<Event> exactEvent = findEventFromQuestion(userMessage);
            if (exactEvent.isPresent()) {
                Event event = exactEvent.get();
                return "Giá vé của sự kiện '" + event.getTitle() + "' là " + event.getPrice() + " VNĐ.";
            }
            return "Hiện tại hệ thống không tìm thấy sự kiện phù hợp với tên này.";
        }

        if (containsAny(normalized, "tổng vé", "tổng số vé", "còn lại bao nhiêu vé", "còn bao nhiêu vé", "có bao nhiêu vé", "bao nhiêu vé", "vé còn lại", "còn bán bao nhiêu vé")) {
            Optional<Event> exactEvent = findEventFromQuestion(userMessage);
            if (exactEvent.isPresent()) {
                Event event = exactEvent.get();
                if (event.getAvailableTickets() != null && event.getAvailableTickets() == 0 || isEventSaleClosedByTime(event)) {
                    return "Sự kiện '" + event.getTitle() + "' đã đóng bán, không còn vé AVAILABLE.";
                }
                return "Sự kiện '" + event.getTitle() + "' hiện còn " + event.getAvailableTickets() + " vé AVAILABLE. " +
                        "Địa điểm: " + event.getLocation() + ", thời gian: " + event.getDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ".";
            }

            Optional<Event> largest = eventRepository.findFirstByAvailableTicketsGreaterThanOrderByAvailableTicketsDesc(0);
            if (largest.isPresent()) {
                Event event = largest.get();
                return "Sự kiện có nhiều vé AVAILABLE nhất hiện tại là '" + event.getTitle() + "' tại " + event.getLocation() + ", " +
                        "diễn ra vào " + event.getDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ", " +
                        "còn " + event.getAvailableTickets() + " vé trống.";
            }
            return "Hiện tại không có sự kiện có vé AVAILABLE để trả lời câu hỏi này.";
        }

        if (containsAny(normalized, "dưới 500000", "<500000", "500.000")) {
            List<Event> cheapEvents = eventRepository.findTop5ByPriceLessThanEqualAndAvailableTicketsGreaterThanOrderByPriceAsc(new BigDecimal("500000"), 0);
            if (!cheapEvents.isEmpty()) {
                StringBuilder builder = new StringBuilder();
                builder.append("Các sự kiện có vé giá dưới hoặc bằng 500000 VNĐ còn AVAILABLE:\n");
                for (Event event : cheapEvents) {
                    builder.append("- ").append(event.getTitle())
                            .append(" | Địa điểm: ").append(event.getLocation())
                            .append(" | Giá: ").append(event.getPrice()).append(" VNĐ")
                            .append(" | Còn: ").append(event.getAvailableTickets()).append(" vé\n");
                }
                return builder.toString().trim();
            }
            return "Hiện tại không có sự kiện nào trong hệ thống với vé giá dưới 500000 VNĐ còn AVAILABLE.";
        }

        if (containsAny(normalized, "ở đâu", "địa điểm", "nằm ở")) {
            Optional<Event> exactEvent = eventRepository.findFirstByTitleIgnoreCase(userMessage.trim());
            if (exactEvent.isPresent()) {
                Event event = exactEvent.get();
                return "Sự kiện '" + event.getTitle() + "' được tổ chức tại " + event.getLocation() + ", " +
                        "diễn ra vào " + event.getDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ".";
            }
            List<Event> events = eventRepository.findTop5ByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(userMessage, userMessage);
            if (!events.isEmpty()) {
                Event event = events.get(0);
                return "Sự kiện gần nhất với truy vấn là '" + event.getTitle() + "' tại " + event.getLocation() + ", " +
                        "diễn ra vào " + event.getDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + ".";
            }
            return null;
        }

        return null;
    }

    private Optional<Event> findEventFromQuestion(String userMessage) {
        if (userMessage == null || userMessage.trim().isBlank()) {
            return Optional.empty();
        }

        String normalized = userMessage.trim();
        String titleCandidate = extractEventTitle(normalized);

        if (!titleCandidate.isBlank() && !titleCandidate.equalsIgnoreCase(normalized)) {
            Optional<Event> exactEvent = eventRepository.findFirstByTitleIgnoreCase(titleCandidate);
            if (exactEvent.isPresent()) {
                return exactEvent;
            }
            List<Event> titleMatches = eventRepository.findTop5ByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(titleCandidate, titleCandidate);
            if (!titleMatches.isEmpty()) {
                return Optional.of(titleMatches.get(0));
            }
            List<Event> searched = searchEventsByKeyword(titleCandidate);
            if (!searched.isEmpty()) {
                return Optional.of(searched.get(0));
            }
            Optional<Event> fuzzyEvent = findEventByNormalizedTitle(titleCandidate);
            if (fuzzyEvent.isPresent()) {
                return fuzzyEvent;
            }
        }

        Optional<Event> exactEvent = eventRepository.findFirstByTitleIgnoreCase(normalized);
        if (exactEvent.isPresent()) {
            return exactEvent;
        }

        List<Event> events = eventRepository.findTop5ByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(normalized, normalized);
        if (!events.isEmpty()) {
            return Optional.of(events.get(0));
        }
        List<Event> searched = searchEventsByKeyword(normalized);
        if (!searched.isEmpty()) {
            return Optional.of(searched.get(0));
        }
        Optional<Event> fuzzyEvent = findEventByNormalizedTitle(normalized);
        if (fuzzyEvent.isPresent()) {
            return fuzzyEvent;
        }
        return Optional.empty();
    }

    private Optional<Event> findEventByNormalizedTitle(String query) {
        String normalizedQuery = normalizeForMatching(query);
        List<Event> allEvents = eventRepository.findAll();
        return allEvents.stream()
                .filter(event -> normalizeForMatching(event.getTitle()).contains(normalizedQuery)
                        || normalizeForMatching(event.getLocation()).contains(normalizedQuery))
                .findFirst();
    }

    private String normalizeForMatching(String text) {
        if (text == null) {
            return "";
        }
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return normalized;
    }

    private List<Event> searchEventsByKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        return eventRepository.searchEvents(keyword, PageRequest.of(0, 5, Sort.by(Sort.Direction.ASC, "dateTime"))).getContent();
    }

    private String extractEventTitle(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "";
        }
        String normalized = normalizeSearchText(userMessage);

        normalized = normalized.replaceAll("(?i)^(?:\\d+)\\s*(?:vé|ticket)s?\\s+", "");
        normalized = normalized.replaceAll("(?i)\\s+có tổng giá bao nhiêu.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+tổng giá bao nhiêu.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+giá bao nhiêu.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+bao nhiêu tiền.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+cần trả bao nhiêu.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+giá của.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+giá.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+có bao nhiêu vé.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+còn bao nhiêu vé.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+còn lại bao nhiêu vé.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+bao nhiêu vé.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+có bao nhiêu.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+còn bao nhiêu.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+ở đâu.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+tại.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+ở.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+địa điểm.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+được tổ chức khi nào.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+được tổ chức.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+tổ chức khi nào.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+diễn ra khi nào.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+diễn ra.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+hết hạn bán.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+đã hết hạn.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+hết hạn.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+còn bán.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+hết vé.*$", "");
        normalized = normalized.replaceAll("(?i)\\s+đã diễn ra.*$", "");
        normalized = normalized.replaceAll("\\s+", " ").trim();
        return normalized;
    }

    private String normalizeSearchText(String text) {
        if (text == null) {
            return "";
        }
        String cleaned = text.trim();
        cleaned = cleaned.replaceAll("[\\\"']", "");
        cleaned = cleaned.replaceAll("[^\\p{L}\\p{N}\\s,.-]", " ");
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        return cleaned;
    }

    private boolean isEventSaleClosedByTime(Event event) {
        if (event == null || event.getDateTime() == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = event.getDateTime().minusHours(2);
        return !now.isBefore(cutoff);
    }

    private boolean containsAny(String normalized, String... words) {
        for (String word : words) {
            if (normalized.contains(word)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsAll(String normalized, String... words) {
        for (String word : words) {
            if (!normalized.contains(word)) {
                return false;
            }
        }
        return true;
    }

    private record ChatResult(String text, String finishReason) {}

    private List<Map<String, Object>> buildContinuationMessages(String userMessage, String previousAssistantReply, String dataContext) {
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", PROJECT_SYSTEM_PROMPT);

        String userContent = userMessage;
        if (dataContext != null && !dataContext.isBlank()) {
            userContent = "Dữ liệu hiện tại của hệ thống:\n" + dataContext + "\n\n" + userMessage;
        }

        Map<String, Object> userMessageMap = new HashMap<>();
        userMessageMap.put("role", "user");
        userMessageMap.put("content", userContent);

        Map<String, Object> assistantMessage = new HashMap<>();
        assistantMessage.put("role", "assistant");
        assistantMessage.put("content", previousAssistantReply);

        Map<String, Object> continuePrompt = new HashMap<>();
        continuePrompt.put("role", "user");
        continuePrompt.put("content", "Tiếp tục trả lời từ chỗ dừng trước đó và hoàn thành toàn bộ nội dung. Kết thúc bằng một câu tóm tắt ngắn gọn.");

        return List.of(systemMessage, userMessageMap, assistantMessage, continuePrompt);
    }

    private ChatResult parseChatResult(String responseBody) throws IOException {
        JsonNode json = objectMapper.readTree(responseBody);
        String text = extractResponseContent(json.path("choices").path(0).path("message").path("content"));
        if (text.isBlank()) {
            text = extractResponseContent(json.path("output_text"));
        }
        String finishReason = json.path("choices").path(0).path("finish_reason").asText("");
        return new ChatResult(text, finishReason);
    }

    private String continueIfTruncated(String userMessage, String partialText, String dataContext, boolean isGemini, String model, String endpoint, String apiKey) {
        if (partialText == null || partialText.isBlank()) {
            return partialText;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("messages", buildContinuationMessages(userMessage, partialText, dataContext));
        payload.put("temperature", 0.7);
        payload.put("max_tokens", 2048);

        try {
            String body = objectMapper.writeValueAsString(payload);
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body));

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                ChatResult nextResult = parseChatResult(response.body());
                if (!nextResult.text.isBlank()) {
                    return partialText + "\n" + nextResult.text;
                }
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return partialText;
    }

    private String extractResponseContent(JsonNode contentNode) {
        if (contentNode.isMissingNode() || contentNode.isNull()) {
            return "";
        }
        if (contentNode.isTextual()) {
            return contentNode.asText().trim();
        }
        if (contentNode.isObject()) {
            if (contentNode.has("text")) {
                return extractResponseContent(contentNode.path("text"));
            }
            if (contentNode.has("content")) {
                return extractResponseContent(contentNode.path("content"));
            }
            StringBuilder builder = new StringBuilder();
            contentNode.fields().forEachRemaining(entry -> {
                String part = extractResponseContent(entry.getValue());
                if (!part.isBlank()) {
                    if (builder.length() > 0) {
                        builder.append("\n");
                    }
                    builder.append(part);
                }
            });
            return builder.toString().trim();
        }
        if (contentNode.isArray()) {
            StringBuilder builder = new StringBuilder();
            for (JsonNode item : contentNode) {
                String part = extractResponseContent(item);
                if (!part.isBlank()) {
                    if (builder.length() > 0) {
                        builder.append("\n");
                    }
                    builder.append(part);
                }
            }
            return builder.toString().trim();
        }
        return contentNode.toString().trim();
    }

    private String askOpenAI(String userMessage) {
        return askOpenAI(userMessage, null);
    }

    private String askOpenAI(String userMessage, String dataContext) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", openAiModel);
            payload.put("messages", buildChatMessages(userMessage, dataContext));
            payload.put("temperature", 0.7);
            payload.put("max_tokens", 2048);

            String body = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            
            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                ChatResult result = parseChatResult(response.body());
                if ("length".
                        equalsIgnoreCase(result.finishReason)) {
                    return continueIfTruncated(userMessage, result.text, dataContext, false, openAiModel, "https://api.openai.com/v1/chat/completions", openAiApiKey);
                }
                if (!result.text.isBlank()) {
                    return result.text;
                }
                return "OpenAI trả về dữ liệu không hợp lệ.";
            }

            return "Lỗi OpenAI: HTTP " + response.statusCode() + ". " + response.body();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Đã xảy ra lỗi khi gọi OpenAI: " + e.getMessage();
        }
    }

    private String askGemini(String userMessage) {
        return askGemini(userMessage, null);
    }

    private String askGemini(String userMessage, String dataContext) {
        List<String> modelCandidates = List.of(
                geminiModel,
                "gemini-3.5-flash",
                "gemini-3.1-flash-lite",
                "gemini-2.5-flash",
                "gemini-2.5-flash-lite"
        );
        HttpClient client = HttpClient.newHttpClient();
        String lastBody = null;
        int lastStatus = -1;

        for (String model : modelCandidates) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", model);
            payload.put("messages", buildChatMessages(userMessage, dataContext));
            payload.put("temperature", 0.7);
            payload.put("max_tokens", 2048);

            String body;
            try {
                body = objectMapper.writeValueAsString(payload);
            } catch (IOException e) {
                return "Lỗi khi xây dựng payload Gemini: " + e.getMessage();
            }

            String[] endpoints = new String[]{
                    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                    "https://generativelanguage.googleapis.com/v1beta2/openai/chat/completions"
            };

            for (String endpoint : endpoints) {
                try {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(endpoint))
                            .timeout(Duration.ofSeconds(30))
                            .header("Content-Type", "application/json")
                            .header("Authorization", "Bearer " + geminiApiKey)
                            .POST(HttpRequest.BodyPublishers.ofString(body))
                            .build();
                    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                    lastStatus = response.statusCode();
                    lastBody = response.body();

                    if (response.statusCode() >= 200 && response.statusCode() < 300) {
                        ChatResult result = parseChatResult(response.body());
                        if ("length".equalsIgnoreCase(result.finishReason)) {
                            return continueIfTruncated(userMessage, result.text, dataContext, true, model, endpoint, geminiApiKey);
                        }
                        if (!result.text.isBlank()) {
                            return result.text;
                        }
                        return "Gemini trả về dữ liệu không hợp lệ.";
                    }

                    if (response.statusCode() != 404) {
                        break;
                    }
                } catch (IOException | InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return "Đã xảy ra lỗi khi gọi Gemini: " + e.getMessage();
                }
            }
        }

        if (lastStatus == 403) {
            return "Lỗi Gemini: HTTP 403. Kiểm tra API key và quyền truy cập Generative Language API.";
        }
        if (lastStatus == 404) {
            return "Lỗi Gemini: HTTP 404. Kiểm tra model hoặc endpoint. Các model thử: " + String.join(", ", modelCandidates) + ".";
        }
        return "Lỗi Gemini: HTTP " + lastStatus + ". Body: " + (lastBody == null ? "" : lastBody);
    }

    private String localFallback(String userMessage, String dataContext) {
        String normalized = userMessage.trim().toLowerCase();

        String directAnswer = buildDirectAnswer(userMessage);
        if (directAnswer != null) {
            return directAnswer;
        }

        if (dataContext != null && !dataContext.isBlank()) {
            return dataContext;
        }

        if (normalized.contains("vé") || normalized.contains("sự kiện") || normalized.contains("event") || normalized.contains("ticket")) {
            List<Event> events = eventRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.ASC, "dateTime"))).getContent();
            if (!events.isEmpty()) {
                return "Dưới đây là một số sự kiện hiện có trong hệ thống:\n" + buildEventFacts(events);
            }
            return "Hiện tại hệ thống chưa có dữ liệu sự kiện.";
        }

        if (normalized.contains("hủy") || normalized.contains("huỷ")) {
            return "Bạn có thể hủy vé nếu trạng thái là RESERVED. Nếu đã thanh toán, vui lòng liên hệ hỗ trợ để xử lý.";
        }
        if (normalized.contains("thanh toán") || normalized.contains("vnpay") || normalized.contains("pay")) {
            return "Thanh toán bằng VNPay cần hoàn tất trong 10 phút sau khi giữ chỗ. Nếu quá hạn, vui lòng đặt vé lại.";
        }
        if (normalized.contains("địa điểm") || normalized.contains("địa chỉ") || normalized.contains("location")) {
            return "Thông tin địa điểm và thời gian sự kiện được hiển thị trong chi tiết event. Vui lòng mở event để xem chi tiết.";
        }
        return "Mình đang ở chế độ trả lời cục bộ và có thể giúp bạn hướng dẫn chung về sự kiện, vé và thanh toán.";
    }
}
