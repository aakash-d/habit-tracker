package com.tracker.habit_tracker_api.habit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
	List<Habit> findAllByOrderByOrderAsc();
}
