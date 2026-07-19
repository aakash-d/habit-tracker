package com.tracker.habit_tracker_api.habit;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Frequency {
	// "daily" | "weekdays" | "specificDays" | "timesPerWeek"
	private String type;
	
	// only for specificDays (0=Sun ... 6=Sat); null otherwise
	private List<Integer> days;
	
	// only for timesPerWeek; null otherwise
	private Integer count;
}
