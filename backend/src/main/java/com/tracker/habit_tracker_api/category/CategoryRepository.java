package com.tracker.habit_tracker_api.category;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
	List<Category> findByUserId(Long userId);
	Optional<Category> findByIdAndUserId(Long id, Long userId);
}