package com.tracker.habit_tracker_api.category;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tracker.habit_tracker_api.category.dto.CategoryRequest;
import com.tracker.habit_tracker_api.category.dto.CategoryResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Categories", description = "Manage habit categories")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
	
	  private final CategoryService service;
	  
	  @Operation(summary = "Get all categories")
	  @GetMapping
	  public List<CategoryResponse> getAll() {
		  return service.findAll();
	  }
	  
	  @Operation(summary = "Create a category")
	  @PostMapping
	  @ResponseStatus(HttpStatus.CREATED)
	  public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
		  return service.create(request);
	  }
	  
	  @Operation(summary = "Update a category")
	  @PutMapping("/{id}")
	  public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
		  return service.update(id, request);
	  }
	  
	  @Operation(summary = "Delete a category")
	  @DeleteMapping("/{id}")
	  @ResponseStatus(HttpStatus.NO_CONTENT)
	  public void delete(@PathVariable Long id) {
		  service.delete(id);
	  }
}
