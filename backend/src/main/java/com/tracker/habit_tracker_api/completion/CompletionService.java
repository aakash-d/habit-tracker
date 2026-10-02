package com.tracker.habit_tracker_api.completion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tracker.habit_tracker_api.auth.CurrentUser;
import com.tracker.habit_tracker_api.completion.dto.CompletionRequest;
import com.tracker.habit_tracker_api.completion.dto.DayRecordResponse;
import com.tracker.habit_tracker_api.habit.Habit;
import com.tracker.habit_tracker_api.habit.HabitRepository;
import com.tracker.habit_tracker_api.habit.Measurement;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompletionService {
	
	private final CompletionRepository repository;
	private final HabitRepository habitRepository;
	private final CurrentUser currentUser;
	
	/** Upsert: create or update the completion for (habitId, date) */
	public void setCompletion(CompletionRequest request) {
		Long userId = currentUser.getId();
		
		Habit habit = habitRepository
                .findByIdAndUserId(request.getHabitId(), userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Habit not found: " + request.getHabitId())); 
		
		Completion completion = repository
				.findByUserIdAndHabitIdAndDate(currentUser.getId(), request.getHabitId(), request.getDate())
				.orElseGet(() -> Completion.builder()
						.userId(currentUser.getId())
						.habitId(request.getHabitId())
						.date(request.getDate())
						.build());
		
		if (request.getValue() != null) {
            completion.setValue(request.getValue());
            completion.setDone(deriveDone(habit, request.getValue(), request.getDone()));
        } else { 
        	completion.setDone(request.getDone());
        }
		
		if(request.getNote() != null) {
			completion.setNote(request.getNote());
		}
		
		repository.save(completion);
	}
	
	/** Returns nested RecordsByDate shape for a date range */
	public Map<String, DayRecordResponse> getRange(LocalDate from, LocalDate to) {
		List<Completion> rows = repository.findByUserIdAndDateBetween(currentUser.getId(), from, to);
		
		// date -> (habitId -> done) and date -> (habitId -> note)
		Map<String, Map<String, Boolean>> completionsByDate = new HashMap<>();
		Map<String, Map<String, String>> notesByDate = new HashMap<>();
		Map<String, Map<String, BigDecimal>> valuesByDate = new HashMap<>();
		
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
			
			if (c.getValue() != null) {
                valuesByDate
                        .computeIfAbsent(dateKey, k -> new HashMap<>())
                        .put(habitKey, c.getValue());
            }
		}
		
		Map<String, DayRecordResponse> result = new HashMap<>();
		for(String dateKey : completionsByDate.keySet()) {
			result.put(dateKey, DayRecordResponse.builder()
					.completions(completionsByDate.getOrDefault(dateKey, new HashMap<>()))
					.taskNotes(notesByDate.getOrDefault(dateKey, new HashMap<>()))
					.values(valuesByDate.getOrDefault(dateKey, new HashMap<>()))
					.build());
		}
		// include dates that only have notes but somehow no completion row (edge case; usually none)
		for(String dateKey : notesByDate.keySet()) {
			result.computeIfAbsent(dateKey, k -> DayRecordResponse.builder()
					.completions(new HashMap<>())
					.taskNotes(notesByDate.get(dateKey))
					.values(valuesByDate.getOrDefault(dateKey, new HashMap<>()))
					.build());
		}
		
		return result;
	}
	
	/**
     * For measurable habits, done is derived from value vs target.
     * For binary habits (or no value supplied), the explicit done wins.
     */
    private boolean deriveDone(Habit habit, BigDecimal value, Boolean explicitDone) {
        Measurement m = habit.getMeasurement();
        boolean measurable = m != null
                && "count".equals(m.getType())
                && m.getTarget() != null;

        if (!measurable) {
            return Boolean.TRUE.equals(explicitDone);
        }
        if ("atMost".equals(m.getDirection())) {
            return value.compareTo(m.getTarget()) <= 0;
        }
        return value.compareTo(m.getTarget()) >= 0;
    } 
}