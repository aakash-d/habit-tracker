package com.tracker.habit_tracker_api.completion;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompletionRepository extends JpaRepository<Completion, Long> {
	
	Optional<Completion> findByHabitIdAndDate(Long habitId, LocalDate date);
	
	List<Completion> findByDateBetween(LocalDate from, LocalDate to);
	
	List<Completion> findByHabitIdAndDoneTrue(Long habitId);
}
