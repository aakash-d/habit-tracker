package com.tracker.habit_tracker_api.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
	
	@NotBlank(message = "Name is required")
	private String name;
	
	@NotBlank(message = "Color is required")
	private String color;
	
}
