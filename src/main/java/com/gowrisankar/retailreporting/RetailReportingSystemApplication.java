package com.gowrisankar.retailreporting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class RetailReportingSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetailReportingSystemApplication.class, args);
    }
}
