package com.tracker.habit_tracker_api.completion.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompletionRequest {
	
	@NotNull(message = "habitId is required")
	private Long habitId;
	
	@NotNull(message = "date is required")
	private LocalDate date;
	
	@NotNull(message = "done is required")
	private Boolean done;
	
	private String note; // optional per-task note
}
