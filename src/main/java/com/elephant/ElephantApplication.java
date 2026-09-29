package com.elephant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ElephantApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElephantApplication.class, args);
    }
}
