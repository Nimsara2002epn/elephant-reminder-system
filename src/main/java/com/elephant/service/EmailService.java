package com.elephant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendReminderEmail(String toEmail, String subject, String body) {
        if (mailSender == null) {
            System.out.println("⚠️  Mail sender not configured. Skipping email to: " + toEmail);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("[Elephant] " + subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("📧 Email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}
