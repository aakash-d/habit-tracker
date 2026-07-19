package com.tracker.habit_tracker_api.daynote;

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

import com.tracker.habit_tracker_api.daynote.dto.DayNoteRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Day Notes", description = "One free text note per day")
@RestController
@RequestMapping("/api/day-notes")
@RequiredArgsConstructor
public class DayNoteController {
	
	private final DayNoteService service;
	
	@Operation(summary = "Get day notes in a date range (date -> note)")
	@GetMapping
	public Map<String, String> getRange(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		return service.getRange(from, to);
	}
	
	@Operation(summary = "Set (create/update) a day note")
	@PutMapping
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void setNote(@Valid @RequestBody DayNoteRequest request) {
		service.setNote(request);
	}
}