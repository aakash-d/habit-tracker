package com.tracker.habit_tracker_api.habit;

import java.time.LocalDate;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
@Table(name = "habit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String name;
	
	private String icon;
	
	// optional reference to a category
	private Long categoryId;
	
	// JSON column holding the frequency object
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "json", nullable = false)
	private Frequency frequency;
	
	@Column(name = "sort_order", nullable = false)
	private Integer order;
	
	@Column(nullable = false)
	private LocalDate createdAt;
	
	@Column(nullable = false)
	private Boolean archived;
}