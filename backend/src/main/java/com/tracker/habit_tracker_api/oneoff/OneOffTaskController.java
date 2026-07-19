package com.tracker.habit_tracker_api.oneoff;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tracker.habit_tracker_api.oneoff.dto.OneOffRequest;
import com.tracker.habit_tracker_api.oneoff.dto.OneOffResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "One-off Tasks", description = "Single date tasks")
@RestController
@RequestMapping("/api/one-offs")
@RequiredArgsConstructor
public class OneOffTaskController {
	
	private final OneOffTaskService service;
	
	@Operation(summary = "Get one-off tasks in a date range")
	@GetMapping
	public List<OneOffResponse> getRange(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return service.getRange(from, to);
	}
	
	@Operation(summary = "Create a one-off task")
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public OneOffResponse create(@Valid @RequestBody OneOffRequest request) {
		return service.create(request);
	}
	
	@Operation(summary = "Toggle a one-off task's done status")
	@PatchMapping("/{id}/toggle")
	public OneOffResponse toggle(@PathVariable Long id) {
		return service.toggle(id);
	}
	
	@Operation(summary = "Delete a one-off task")
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}
}