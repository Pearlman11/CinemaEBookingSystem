package com.SWE.CinemaEBookingSystem.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername("p3kellyga@gmail.com");
        mailSender.setPassword("lmzr fklj gcgn qdij"); // ✅ Replace with your App Password

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true"); // ✅ Important for Gmail
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com"); // ✅ Prevent SSL issues
        props.put("mail.debug", "true"); // ✅ Debug mode

        return mailSender;
    }
}
