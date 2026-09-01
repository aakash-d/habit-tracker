package com.tracker.habit_tracker_api.category;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tracker.habit_tracker_api.auth.CurrentUser;
import com.tracker.habit_tracker_api.category.dto.CategoryRequest;
import com.tracker.habit_tracker_api.category.dto.CategoryResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
	
	private final CategoryRepository repository;
	private final CurrentUser currentUser;
	
	public List<CategoryResponse> findAll() {
		return repository.findByUserId(currentUser.getId()).stream()
				.map(this::toResponse)
				.toList();
	}
	
	public CategoryResponse create(CategoryRequest request) {
		Category saved = repository.save(
				Category.builder()
						.name(request.getName())
						.color(request.getColor())
						.userId(currentUser.getId())
						.build()
						);
		return toResponse(saved);
	}
	
	public CategoryResponse update(Long id, CategoryRequest request) {
		Category category = repository.findByIdAndUserId(id, currentUser.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found: " + id));
		category.setName(request.getName());
		category.setColor(request.getColor());
		return toResponse(repository.save(category));
	}
	
	public void delete(Long id) {
		Category category = repository.findByIdAndUserId(id, currentUser.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found: " + id));
		repository.delete(category);
	}
	
	private CategoryResponse toResponse(Category c) {
		return new CategoryResponse(c.getId(), c.getName(), c.getColor());
	}
}