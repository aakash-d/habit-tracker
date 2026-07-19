package com.tracker.habit_tracker_api.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class CategoryResponse {
	
	private String id;
	private String name;
	private String color;
	
	public CategoryResponse(Long id, String name, String color) {
		this.id = String.valueOf(id);
		this.name = name;
		this.color = color;
	}
}