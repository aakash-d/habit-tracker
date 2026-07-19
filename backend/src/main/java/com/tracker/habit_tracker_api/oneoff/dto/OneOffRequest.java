package com.tracker.habit_tracker_api.oneoff.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OneOffRequest {
	
	@NotBlank(message = "name is required")
	private String name;
	
	@NotNull(message = "date is required")
	private LocalDate date;
	
	private Long categoryId;
	
	private String note;
}
