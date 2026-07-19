package com.tracker.habit_tracker_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {
	
	@Bean
	public OpenAPI habitTrackerOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Habit Tracker API")
						.description("REST API for the habit tracking application")
						.version("v1"));
	}
}
