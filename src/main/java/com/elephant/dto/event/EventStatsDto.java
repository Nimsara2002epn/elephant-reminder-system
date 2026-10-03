package com.elephant.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventStatsDto {
    private long total;
    private long scheduled;
    private long completed;
    private long cancelled;
}
