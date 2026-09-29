package com.elephant.config;

import com.elephant.model.User;
import com.elephant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = userRepository.findByEmail("admin@elephant.com").orElse(new User());
        admin.setName("Administrator");
        admin.setEmail("admin@elephant.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        userRepository.save(admin);

        User user = userRepository.findByEmail("nimsara@test.com").orElse(new User());
        user.setName("Nimsara Wickramasinghe");
        user.setEmail("nimsara@test.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole("USER");
        user.setEnabled(true);
        userRepository.save(user);

        System.out.println("✅ Default accounts initialized:");
        System.out.println("   Admin: admin@elephant.com / admin123");
        System.out.println("   User:  nimsara@test.com / password123");
    }
}
