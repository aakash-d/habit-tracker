package com.tracker.habit_tracker_api.completion;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
	name = "completion",
	uniqueConstraints = @UniqueConstraint(columnNames = {"habit_id", "names"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Completion {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "habit_id", nullable = false)
	private Long habitId;
	
	@Column(nullable = false)
	private LocalDate date;
	
	@Column(nullable = false)
	private Boolean done;
	
	@Column(columnDefinition = "TEXT")
	private String note; // per-task note (taskNotes[habitId] in frontend)
}