package com.tracker.habit_tracker_api.oneoff;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "one_off_task")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OneOffTask {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String name;
	
	@Column(nullable = false)
	private LocalDate date;
	
	private Long categoryId;
	
	@Column(columnDefinition = "TEXT")
	private String note;
	
	@Column(nullable = false)
	private Boolean done;
}