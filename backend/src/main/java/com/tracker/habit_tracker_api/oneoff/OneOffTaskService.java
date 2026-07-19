package com.tracker.habit_tracker_api.oneoff;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tracker.habit_tracker_api.oneoff.dto.OneOffRequest;
import com.tracker.habit_tracker_api.oneoff.dto.OneOffResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OneOffTaskService {
	
	private final OneOffTaskRepository repository;
	
	public List<OneOffResponse> getRange(LocalDate from, LocalDate to) {
		return repository.findByDateBetween(from, to).stream()
				.map(this::toResponse)
				.toList();
	}
	
	public OneOffResponse create(OneOffRequest request) {
		OneOffTask task = OneOffTask.builder()
				.name(request.getName())
				.date(request.getDate())
				.categoryId(request.getCategoryId())
				.note(request.getNote())
				.done(false)
				.build();
		return toResponse(repository.save(task));
	}
	
	public OneOffResponse toggle(Long id) {
		OneOffTask task = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("One-off task not found: " + id));
		task.setDone(!Boolean.TRUE.equals(task.getDone()));
		return(toResponse(repository.save(task)));
	}
	
	public void delete(Long id) {
		repository.deleteById(id);
	}
	
	private OneOffResponse toResponse(OneOffTask t) {
		return OneOffResponse.builder()
				.id(String.valueOf(t.getId()))
				.name(t.getName())
				.date(t.getDate())
				.categoryId(t.getCategoryId() != null ? String.valueOf(t.getCategoryId()) : null)
				.note(t.getNote())
				.done(t.getDone())
				.build();
	}
}
