package com.duong.eventticket.service.impl;

import com.duong.eventticket.entity.Booking;
import com.duong.eventticket.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@eventticket.local}")
    private String fromEmail;

    @Override
    public void sendTicketEmail(Booking booking) {
        if (booking == null || booking.getUser() == null || booking.getUser().getEmail() == null) {
            log.warn("Skipping ticket email because booking or user email is missing.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = "🎟️ Vé sự kiện của bạn - " + booking.getEvent().getTitle();

            byte[] qrImageBytes = generateQrImageBytes(booking.getQrCodeValue(), 300);

            String html = buildTicketHtml(booking, qrImageBytes != null);

            helper.setFrom(fromEmail);
            helper.setTo(booking.getUser().getEmail());
            helper.setSubject(subject);
            helper.setText(html, true);

            if (qrImageBytes != null) {
                helper.addInline("qrcode", new ByteArrayResource(qrImageBytes), "image/png");
            }

            mailSender.send(message);
            log.info("Sent ticket email to {} for booking {}", booking.getUser().getEmail(), booking.getId());
        } catch (MessagingException e) {
            log.error("Failed to send ticket email for booking {}: {}", booking.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void sendRefundEmail(Booking booking) {
        if (booking == null || booking.getUser() == null || booking.getUser().getEmail() == null) {
            log.warn("Skipping refund email because booking or user email is missing.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = "✅ Xác nhận hoàn tiền vé sự kiện - " + booking.getEvent().getTitle();
            String html = buildRefundHtml(booking);

            helper.setFrom(fromEmail);
            helper.setTo(booking.getUser().getEmail());
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Sent refund email to {} for booking {}", booking.getUser().getEmail(), booking.getId());
        } catch (MessagingException e) {
            log.error("Failed to send refund email for booking {}: {}", booking.getId(), e.getMessage(), e);
        }
    }

    private byte[] generateQrImageBytes(String text, int size) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            QRCodeWriter qrWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrWriter.encode(text, BarcodeFormat.QR_CODE, size, size);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
            return baos.toByteArray();
        } catch (Exception ex) {
            log.warn("Failed to generate QR image for email: {}", ex.getMessage());
            return null;
        }
    }

    private String buildTicketHtml(Booking booking, boolean hasQrImage) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = booking.getEvent().getDateTime().format(formatter);

        NumberFormat currencyFormat = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        String formattedPrice = currencyFormat.format(booking.getTotalPrice()) + " VND";

        String qrSection;
        if (hasQrImage) {
            qrSection = "<div style='margin: 24px 0; text-align: center;'>"
                    + "<p style='margin-bottom: 8px; font-weight: bold; color: #374151;'> Mã QR Check-in của bạn:</p>"
                    + "<img src='cid:qrcode' alt='QR Code' style='width:220px; height:220px; border: 4px solid #2563eb; border-radius: 12px; padding: 8px; background:#fff;' />"
                    + "<p style='margin-top: 8px; font-size: 11px; color: #6b7280; word-break: break-all;'>" + booking.getQrCodeValue() + "</p>"
                    + "</div>";
        } else {
            qrSection = "<p><strong>Mã QR:</strong> " + booking.getQrCodeValue() + "</p>";
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;'>"

                + "<div style='background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; text-align: center;'>"
                + "<h1 style='color: #ffffff; margin: 0; font-size: 26px;'>🎟️ Vé Sự Kiện Của Bạn</h1>"
                + "<p style='color: #bfdbfe; margin: 8px 0 0; font-size: 14px;'>Cảm ơn bạn đã đặt vé!</p>"
                + "</div>"

                + "<div style='padding: 28px 32px; background: #ffffff;'>"
                + "<p style='color: #1f2937; font-size: 16px;'>Xin chào <strong style='color: #1e40af;'>" + escapeHtml(booking.getUser().getFullName()) + "</strong>,</p>"
                + "<p style='color: #374151;'>Thanh toán của bạn đã thành công. Dưới đây là thông tin vé:</p>"

                + "<table style='width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;'>"
                + buildRow(" Sự kiện", escapeHtml(booking.getEvent().getTitle()))
                + buildRow(" Địa điểm", escapeHtml(booking.getEvent().getLocation()))
                + buildRow(" Thời gian", formattedDate)
                + buildRow(" Số lượng vé", booking.getQuantity() + " vé")
                + buildRow(" Loại vé", booking.getTicketType() != null ? escapeHtml(booking.getTicketType().getName()) : "---")
                + buildRow(" Tổng tiền", formattedPrice)
                + "</table>"

                + qrSection

                + "<div style='background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-top: 20px;'>"
                + "<p style='margin: 0; color: #1e40af; font-size: 14px;'>️ <strong>Lưu ý:</strong> Vui lòng mang mã QR này (chụp màn hình hoặc in ra) khi đến sự kiện để check-in.</p>"
                + "</div>"
                + "</div>"

                + "<div style='background: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280;'>"
                + "<p style='margin: 0;'>Trân trọng, <strong>Event Ticket Booking System</strong></p>"
                + "<p style='margin: 4px 0 0;'>Đây là email tự động, vui lòng không trả lời email này.</p>"
                + "</div>"

                + "</div>"
                + "</body></html>";
    }
    private String buildRefundHtml(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = booking.getEvent().getDateTime().format(formatter);

        NumberFormat currencyFormat = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        String formattedPrice = currencyFormat.format(booking.getTotalPrice()) + " VND";

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>"
                + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;'>"
                + "<div style='background: linear-gradient(135deg, #047857, #10b981); padding: 32px 24px; text-align: center;'>"
                + "<h1 style='color: #ffffff; margin: 0; font-size: 26px;'>✅ Hoàn tiền vé thành công</h1>"
                + "<p style='color: #bbf7d0; margin: 8px 0 0; font-size: 14px;'>Số tiền hoàn sẽ được trả lại theo phương thức bạn đã thanh toán.</p>"
                + "</div>"
                + "<div style='padding: 28px 32px; background: #ffffff;'>"
                + "<p style='color: #1f2937; font-size: 16px;'>Xin chào <strong style='color: #047857;'>" + escapeHtml(booking.getUser().getFullName()) + "</strong>,</p>"
                + "<p style='color: #374151;'>Yêu cầu hoàn vé của bạn đã được xử lý thành công. Dưới đây là chi tiết:</p>"
                + "<table style='width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;'>"
                + buildRow(" Sự kiện", escapeHtml(booking.getEvent().getTitle()))
                + buildRow(" Địa điểm", escapeHtml(booking.getEvent().getLocation()))
                + buildRow(" Thời gian", formattedDate)
                + buildRow(" Số lượng vé", booking.getQuantity() + " vé")
                + buildRow(" Loại vé", booking.getTicketType() != null ? escapeHtml(booking.getTicketType().getName()) : "---")
                + buildRow(" Lý do hoàn vé", escapeHtml(booking.getRefundReason()))
                + buildRow(" Số tiền hoàn", formattedPrice)
                + "</table>"
                + "<div style='background: #ecfdf5; border-left: 4px solid #34d399; padding: 12px 16px; border-radius: 4px; margin-top: 20px;'>"
                + "<p style='margin: 0; color: #065f46; font-size: 14px;'><strong>Lưu ý:</strong> Thời gian nhận tiền có thể mất từ 1-5 ngày làm việc tùy ngân hàng.</p>"
                + "</div>"
                + "</div>"
                + "<div style='background: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280;'>"
                + "<p style='margin: 0;'>Trân trọng, <strong>Event Ticket Booking System</strong></p>"
                + "</div>"
                + "</div>"
                + "</body></html>";
    }
    private String buildRow(String label, String value) {
        return "<tr>"
                + "<td style='padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; color: #374151; width: 40%;'>" + label + "</td>"
                + "<td style='padding: 8px 12px; border: 1px solid #e5e7eb; color: #1f2937;'>" + value + "</td>"
                + "</tr>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
