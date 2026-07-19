package com.tracker.habit_tracker_api.completion.dto;

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
}
