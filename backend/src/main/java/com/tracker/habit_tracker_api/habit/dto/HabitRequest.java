package com.tracker.habit_tracker_api.habit.dto;

import java.time.LocalDate;

import com.tracker.habit_tracker_api.habit.Frequency;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HabitRequest {
	
	@NotBlank(message = "Name is required")
	private String name;
	
	private String icon;
	
	private Long categoryId;
	
	@NotNull(message = "Frequency is required")
	private Frequency frequency;
	
	// optional on create (defaults to today); required-ish on update
	private LocalDate createdAt;
}