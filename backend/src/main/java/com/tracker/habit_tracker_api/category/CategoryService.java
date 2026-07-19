package com.tracker.habit_tracker_api.category;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tracker.habit_tracker_api.category.dto.CategoryRequest;
import com.tracker.habit_tracker_api.category.dto.CategoryResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
	
	private final CategoryRepository repository;
	
	public List<CategoryResponse> findAll() {
		return repository.findAll().stream()
				.map(this::toResponse)
				.toList();
	}
	
	public CategoryResponse create(CategoryRequest request) {
		Category saved = repository.save(
				Category.builder()
						.name(request.getName())
						.color(request.getColor())
						.build()
						);
		return toResponse(saved);
	}
	
	public CategoryResponse update(Long id, CategoryRequest request) {
		Category category = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Category not found: " + id));
		category.setName(request.getName());
		category.setColor(request.getColor());
		return toResponse(repository.save(category));
	}
	
	public void delete(Long id) {
		repository.deleteById(id);
	}
	
	private CategoryResponse toResponse(Category c) {
		return new CategoryResponse(c.getId(), c.getName(), c.getColor());
	}
}