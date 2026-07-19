package com.tracker.habit_tracker_api.daynote;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;


public interface DayNoteRepository extends JpaRepository<DayNote, Long> {
	
	Optional<DayNote> findByDate(LocalDate date);
	
	List<DayNote> findByDateBetween(LocalDate from, LocalDate to);
}
