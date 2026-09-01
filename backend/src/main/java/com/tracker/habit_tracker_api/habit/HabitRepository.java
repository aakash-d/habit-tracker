package com.tracker.habit_tracker_api.habit;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
	List<Habit> findByUserIdOrderByOrderAsc(Long userId);
	Optional<Habit> findByIdAndUserId(Long id, Long userId);
}
