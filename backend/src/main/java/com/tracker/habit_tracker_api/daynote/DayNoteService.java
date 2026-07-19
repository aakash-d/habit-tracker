package com.tracker.habit_tracker_api.daynote;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.tracker.habit_tracker_api.daynote.dto.DayNoteRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DayNoteService {

	private final DayNoteRepository repository;

	/** Upsert the note for a date. */
	public void setNote(DayNoteRequest request) {
		DayNote dayNote = repository.findByDate(request.getDate())
				.orElseGet(() -> DayNote.builder().date(request.getDate()).build());
		dayNote.setNote(request.getNote());
		repository.save(dayNote);
	}

	/** date -> note, for a range */
	public Map<String, String> getRange(LocalDate from, LocalDate to) {
		List<DayNote> rows = repository.findByDateBetween(from, to);
		Map<String, String> result = new HashMap<>();
		for (DayNote dn : rows) {
			if (dn.getNote() != null && !dn.getNote().isBlank()) {
				result.put(dn.getDate().toString(), dn.getNote());
			}
		}
		return result;
	}
}
