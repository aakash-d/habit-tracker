package com.tracker.habit_tracker_api.daynote.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DayNoteRequest {
	
	@NotNull(message = "data is required")
	private LocalDate date;
	
	private String note; // may be empty string to clear
}
