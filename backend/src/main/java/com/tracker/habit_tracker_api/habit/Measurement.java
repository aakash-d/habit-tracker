package com.tracker.habit_tracker_api.habit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Measurement {
    // "binary" | "count"
    private String type;

    // only for count; null for binary
    private BigDecimal target;

    // display unit, e.g. "L", "reps", "min"
    private String unit;

    // "atLeast" | "atMost" — only for count
    private String direction;
}