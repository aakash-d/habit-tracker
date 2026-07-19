package com.tracker.habit_tracker_api.habit.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StreakResponse {
	private int current;
	private int longest;
	private String unit; // "days" or "weeks"
}