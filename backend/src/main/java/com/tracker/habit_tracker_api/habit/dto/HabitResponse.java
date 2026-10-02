package com.tracker.habit_tracker_api.habit.dto;

import java.time.LocalDate;

import com.tracker.habit_tracker_api.habit.Frequency;
import com.tracker.habit_tracker_api.habit.Measurement;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HabitResponse {
	private String id;
	private String name;
	private String icon;
	private String categoryId;
	private Frequency frequency;
	private Measurement measurement;
	private Integer order;
	private LocalDate createdAt;
	private Boolean archived;
}