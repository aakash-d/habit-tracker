package com.tracker.habit_tracker_api.oneoff;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OneOffTaskRepository extends JpaRepository<OneOffTask, Long> {
	List<OneOffTask> findByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to);
	Optional<OneOffTask> findByIdAndUserId(Long id, Long userId);
}
