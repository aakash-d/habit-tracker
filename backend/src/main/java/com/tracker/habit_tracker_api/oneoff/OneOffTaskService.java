package com.tracker.habit_tracker_api.oneoff;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tracker.habit_tracker_api.auth.CurrentUser;
import com.tracker.habit_tracker_api.oneoff.dto.OneOffRequest;
import com.tracker.habit_tracker_api.oneoff.dto.OneOffResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OneOffTaskService {
	
	private final OneOffTaskRepository repository;
	private final CurrentUser currentUser;
	
	public List<OneOffResponse> getRange(LocalDate from, LocalDate to) {
		return repository.findByUserIdAndDateBetween(currentUser.getId(), from, to).stream()
				.map(this::toResponse)
				.toList();
	}
	
	public OneOffResponse create(OneOffRequest request) {
		OneOffTask task = OneOffTask.builder()
				.userId(currentUser.getId())
				.name(request.getName())
				.date(request.getDate())
				.categoryId(request.getCategoryId())
				.note(request.getNote())
				.done(false)
				.build();
		return toResponse(repository.save(task));
	}
	
	public OneOffResponse toggle(Long id) {
		OneOffTask task = repository.findByIdAndUserId(id, currentUser.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "One-off task not found: " + id));
		task.setDone(!Boolean.TRUE.equals(task.getDone()));
		return(toResponse(repository.save(task)));
	}
	
	public void delete(Long id) {
		OneOffTask task = repository.findByIdAndUserId(id, currentUser.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "One-off task not found: " + id));
		repository.delete(task);
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
