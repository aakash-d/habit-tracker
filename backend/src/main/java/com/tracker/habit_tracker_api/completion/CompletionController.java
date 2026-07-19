package com.tracker.habit_tracker_api.completion;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tracker.habit_tracker_api.completion.dto.CompletionRequest;
import com.tracker.habit_tracker_api.completion.dto.DayRecordResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Completions", description = "Track habit completions per day")
@RestController
@RequestMapping("/api/completions")
@RequiredArgsConstructor
public class CompletionController {
	
	private final CompletionService service;
	
	@Operation(summary = "Get completions in a date range (nested by date)")
	@GetMapping
	public Map<String, DayRecordResponse> getRange(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return service.getRange(from, to);
	}
	
	@Operation(summary = "Set (create/update) a completion for a habit on a date")
	@PutMapping
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void setCompletion(@Valid @RequestBody CompletionRequest request) {
		service.setCompletion(request);
	}
}
