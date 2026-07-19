package com.tracker.habit_tracker_api.completion;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.tracker.habit_tracker_api.completion.dto.CompletionRequest;
import com.tracker.habit_tracker_api.completion.dto.DayRecordResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompletionService {
	
	private final CompletionRepository repository;
	
	/** Upsert: create or update the completion for (habitId, date) */
	public void setCompletion(CompletionRequest request) {
		Completion completion = repository
				.findByHabitIdAndDate(request.getHabitId(), request.getDate())
				.orElseGet(() -> Completion.builder()
						.habitId(request.getHabitId())
						.date(request.getDate())
						.build());
		
		completion.setDone(request.getDone());
		if(request.getNote() != null) {
			completion.setNote(request.getNote());
		}
		repository.save(completion);
	}
	
	/** Returns nested RecordsByDate shape for a date range */
	public Map<String, DayRecordResponse> getRange(LocalDate from, LocalDate to) {
		List<Completion> rows = repository.findByDateBetween(from, to);
		
		// date -> (habitId -> done) and date -> (habitId -> note)
		Map<String, Map<String, Boolean>> completionsByDate = new HashMap<>();
		Map<String, Map<String, String>> notesByDate = new HashMap<>();
		
		for(Completion c : rows) {
			String dateKey = c.getDate().toString();
			String habitKey = String.valueOf(c.getHabitId());
			
			completionsByDate
				.computeIfAbsent(dateKey, k -> new HashMap<>())
				.put(habitKey, c.getDone());
			
			if(c.getNote() != null && !c.getNote().isBlank()) {
				notesByDate
					.computeIfAbsent(dateKey, k -> new HashMap<>())
					.put(habitKey, c.getNote());
			}
		}
		
		Map<String, DayRecordResponse> result = new HashMap<>();
		for(String dateKey : completionsByDate.keySet()) {
			result.put(dateKey, DayRecordResponse.builder()
					.completions(completionsByDate.getOrDefault(dateKey, new HashMap<>()))
					.taskNotes(notesByDate.getOrDefault(dateKey, new HashMap<>()))
					.build());
		}
		// include dates that only have notes but somehow no completion row (edge case; usually none)
		for(String dateKey : notesByDate.keySet()) {
			result.computeIfAbsent(dateKey, k -> DayRecordResponse.builder()
					.completions(new HashMap<>())
					.taskNotes(notesByDate.get(dateKey))
					.build());
		}
		
		return result;
	}
}