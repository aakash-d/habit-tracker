package com.tracker.habit_tracker_api.habit;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tracker.habit_tracker_api.habit.dto.HabitRequest;
import com.tracker.habit_tracker_api.habit.dto.HabitResponse;
import com.tracker.habit_tracker_api.habit.dto.StreakResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Habits", description = "Manage recurring habits")
@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {
	
	private final HabitService service;
	private final StreakService streakService;
	
	@Operation(summary = "Get all habits (sorted by order)")
	@GetMapping
	public List<HabitResponse> getAll() {
		return service.findAll();
	}
	
	@Operation(summary = "Create a habit")
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public HabitResponse create(@Valid @RequestBody HabitRequest request) {
		return service.create(request);
	}
	
	@Operation(summary = "Update a habit")
	@PutMapping("/{id}")
	public HabitResponse update(@PathVariable Long id, @Valid @RequestBody HabitRequest request) {
		return service.update(id, request);
	}
	
	@Operation(summary = "Archive a habit (keeps history")
	@PatchMapping("/{id}/archive")
	public HabitResponse archive(@PathVariable Long id) {
		return service.archive(id);
	}
	
	@Operation(summary = "Reorder a habit up or down")
	@PatchMapping("/{id}/reorder")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void reorder(@PathVariable Long id, @RequestParam String direction) {
		service.reorder(id, direction);
	}
	
	@Operation(summary = "Get current and longest streak for a habit")
	@GetMapping("{id}/streak")
	public StreakResponse getStreak(
			@PathVariable Long id,
			@RequestParam(defaultValue = "0") int weekStart) {
		return streakService.getStreak(id, weekStart);
	}
}