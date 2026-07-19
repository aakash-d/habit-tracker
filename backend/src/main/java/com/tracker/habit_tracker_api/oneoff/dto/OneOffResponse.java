package com.tracker.habit_tracker_api.oneoff.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OneOffResponse {
	private String id;
	private String name;
	private LocalDate date;
	private String categoryId;
	private String note;
	private Boolean done;
}
