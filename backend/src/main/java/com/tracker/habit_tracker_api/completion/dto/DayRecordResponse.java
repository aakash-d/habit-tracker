package com.tracker.habit_tracker_api.completion.dto;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DayRecordResponse {
	// habitId (as string) -> done
	private Map<String, Boolean> completions;
	
	// habitId (as string) -> note
	private Map<String, String> taskNotes;
	
	// habitId (as string) -> recorded value
	private Map<String, BigDecimal> values;
}
