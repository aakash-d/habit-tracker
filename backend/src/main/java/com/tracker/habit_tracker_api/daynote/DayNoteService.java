package com.tracker.habit_tracker_api.daynote;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.tracker.habit_tracker_api.auth.CurrentUser;
import com.tracker.habit_tracker_api.daynote.dto.DayNoteRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DayNoteService {

	private final DayNoteRepository repository;
	private final CurrentUser currentUser;

	/** Upsert the note for a date. */
	public void setNote(DayNoteRequest request) {
		DayNote dayNote = repository.findByUserIdAndDate(currentUser.getId(), request.getDate())
				.orElseGet(() -> DayNote.builder()
						.userId(currentUser.getId())
						.date(request.getDate())
						.build());
		dayNote.setNote(request.getNote());
		repository.save(dayNote);
	}

	/** date -> note, for a range */
	public Map<String, String> getRange(LocalDate from, LocalDate to) {
		List<DayNote> rows = repository.findByUserIdAndDateBetween(currentUser.getId(), from, to);
		Map<String, String> result = new HashMap<>();
		for (DayNote dn : rows) {
			if (dn.getNote() != null && !dn.getNote().isBlank()) {
				result.put(dn.getDate().toString(), dn.getNote());
			}
		}
		return result;
	}
}
