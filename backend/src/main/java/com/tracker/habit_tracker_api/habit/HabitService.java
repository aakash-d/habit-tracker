package com.tracker.habit_tracker_api.habit;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tracker.habit_tracker_api.habit.dto.HabitRequest;
import com.tracker.habit_tracker_api.habit.dto.HabitResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HabitService {
	
	private final HabitRepository repository;
	
	public List<HabitResponse> findAll() {
		return repository.findAllByOrderByOrderAsc().stream()
				.map(this::toResponse)
				.toList();
	}
	
	public HabitResponse create(HabitRequest request) {
		int nextOrder = repository.findAll().stream()
				.mapToInt(h -> h.getOrder() == null ? -1 : h.getOrder())
				.max()
				.orElse(-1) + 1;
		
		Habit habit = Habit.builder()
				.name(request.getName())
				.icon(request.getIcon())
				.categoryId(request.getCategoryId())
				.frequency(request.getFrequency())
				.order(nextOrder)
				.createdAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDate.now())
				.archived(false)
				.build();
		
		return toResponse(repository.save(habit));
	}
	
	public HabitResponse update(Long id, HabitRequest request) {
		Habit habit = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Habit not found: " + id));
		
		habit.setName(request.getName());
		habit.setIcon(request.getIcon());
		habit.setCategoryId(request.getCategoryId());
		habit.setFrequency(request.getFrequency());
		if(request.getCreatedAt() != null) {
			habit.setCreatedAt(request.getCreatedAt());
		}
		return toResponse(repository.save(habit));
	}
	
	public HabitResponse archive(Long id) {
		Habit habit = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Habit not found: " + id));
		habit.setArchived(true);
		return toResponse(repository.save(habit));
	}
	
	public void reorder(Long id, String direction) {
		List<Habit> active = repository.findAllByOrderByOrderAsc().stream()
				.filter(h -> !Boolean.TRUE.equals(h.getArchived()))
				.collect(Collectors.toCollection(ArrayList::new));
		
		int idx = -1;
		for(int i=0; i<active.size(); i++) {
			if(active.get(i).getId().equals(id)) {
				idx = i;
				break;
			}
		}
		if(idx == -1) return;
		
		int swapWith = "up".equals(direction) ? idx - 1 : idx + 1;
		if(swapWith < 0 || swapWith >= active.size()) return;
		
		/** Reorder logic */
		Habit moved = active.remove(idx);
		active.add(swapWith, moved);
		
		// Renumber everyone sequentially: 0, 1, 2, ...
		for(int i=0; i<active.size(); i++) {
			active.get(i).setOrder(i);
		}
		repository.saveAll(active);
	}
	
	private HabitResponse toResponse(Habit h) {
		return HabitResponse.builder()
				.id(String.valueOf(h.getId()))
				.name(h.getName())
				.icon(h.getIcon())
				.categoryId(h.getCategoryId() != null ? String.valueOf(h.getCategoryId()) : null)
				.frequency(h.getFrequency())
				.order(h.getOrder())
				.createdAt(h.getCreatedAt())
				.archived(h.getArchived())
				.build();
	}
}
