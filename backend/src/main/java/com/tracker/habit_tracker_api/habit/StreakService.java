package com.tracker.habit_tracker_api.habit;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.tracker.habit_tracker_api.completion.Completion;
import com.tracker.habit_tracker_api.completion.CompletionRepository;
import com.tracker.habit_tracker_api.habit.dto.StreakResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StreakService {
	
	private final HabitRepository habitRepository;
	private final CompletionRepository completionRepository;
	
	public StreakResponse getStreak(Long habitId, int weekStart) {
		Habit habit = habitRepository.findById(habitId)
				.orElseThrow(() -> new RuntimeException("Habit not found: " + habitId));
		
		// Set of dates this habit was completed
		Set<LocalDate> doneDates = new HashSet<>();
		for(Completion c : completionRepository.findByHabitIdAndDoneTrue(habitId)) {
			doneDates.add(c.getDate());
		}
		
		LocalDate today = LocalDate.now();
		Frequency freq = habit.getFrequency();
		
		if("timesPerWeek".equals(freq.getType())) {
			return weekBasedStreak(habit, doneDates, today, weekStart);
		}
		return dayBasedStreak(habit, doneDates, today);
	}
	
	/** Is the habit scheduled on this date, per its frequency? */
	private boolean isScheduledOn(Frequency freq, LocalDate date) {
		int dow = date.getDayOfWeek().getValue() % 7; // Java: Mon=1..Sun=7 -> convert to Sun=0..Sat=6
		switch(freq.getType()) {
		case "daily":
			return true;
		case "weekdays":
			return dow >= 1 && dow <=5;
		case "specificDays":
			return freq.getDays() != null && freq.getDays().contains(dow);
		case "timesPerWeek":
			return true;
		default:
			return false;
		}
	}
	
	private StreakResponse dayBasedStreak(Habit habit, Set<LocalDate> done, LocalDate today) {
		// Build scheduled dates from createdAt through today, ascending
		List<LocalDate> scheduled = new ArrayList<>();
		LocalDate cursor = habit.getCreatedAt();
		while(!cursor.isAfter(today)) {
			if(isScheduledOn(habit.getFrequency(), cursor)) {
				scheduled.add(cursor);
			}
			cursor = cursor.plusDays(1);
		}
		
		// Longest run of consecutive completed scheduled days
		int longest = 0, run = 0;
		for(LocalDate d : scheduled) {
			if(done.contains(d)) {
				run++;
				longest = Math.max(longest, run);
			} else {
				run = 0;
			}
		}
		
		// Current streak: walk backwards from the end; skip today if scheduled-but-incomplete
		int current = 0;
		for(int i = scheduled.size() - 1; i >= 0; i--) {
			LocalDate d = scheduled.get(i);
			boolean isDone = done.contains(d);
			if (i == scheduled.size() - 1 && d.equals(today) && !isDone) {
				continue; // today not over yet - don't break
			}
			if (isDone)
				current++;
			else
				break;
		}
		
		return StreakResponse.builder()
				.current(current)
				.longest(longest)
				.unit("days")
				.build();
	}
	
	private StreakResponse weekBasedStreak(Habit habit, Set<LocalDate> done, LocalDate today, int weekStart) {
		int target = habit.getFrequency().getCount() != null ? habit.getFrequency().getCount() : 1;
		DayOfWeek startDow = (weekStart == 1) ? DayOfWeek.MONDAY : DayOfWeek.SUNDAY;
		
		// Count completions per week (keyed by that week's start date)
		Map<LocalDate, Integer> perWeek = new HashMap<>();
		for(LocalDate d : done) {
			if(d.isBefore(habit.getCreatedAt()) || d.isAfter(today)) continue;
			LocalDate weekStartDate = d.with(TemporalAdjusters.previousOrSame(startDow));
			perWeek.merge(weekStartDate, 1, Integer::sum);
		}
		
		// Build ordered list of week-starts from createdAt's week -> current week
		List<LocalDate> weeks = new ArrayList<>();
		LocalDate wCursor = habit.getCreatedAt().with(TemporalAdjusters.previousOrSame(startDow));
		LocalDate currentWeek = today.with(TemporalAdjusters.previousOrSame(startDow));
		while(!wCursor.isAfter(currentWeek)) {
			weeks.add(wCursor);
			wCursor = wCursor.plusWeeks(1);
		}
		
		// Longest run of weeks hitting target
		int longest = 0, run = 0;
		for(LocalDate wk : weeks) {
			if(perWeek.getOrDefault(wk, 0) >= target) {
				run++;
				longest = Math.max(longest, run);
			} else {
				run = 0;
			}
		}
		
		// Current run backwards; skip current in-progress week if under target
		int current = 0;
		for(int i = weeks.size() - 1; i >= 0; i--) {
			LocalDate wk = weeks.get(i);
			boolean hit = perWeek.getOrDefault(wk, 0) >= target;
			if(wk.equals(currentWeek) && !hit) {
				continue; // week still in progress
			}
			if (hit) current++;
			else break;
		}
		
		return StreakResponse.builder()
				.current(current)
				.longest(longest)
				.unit("weeks")
				.build();
	}
}
