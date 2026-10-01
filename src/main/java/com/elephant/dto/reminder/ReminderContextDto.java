package com.elephant.dto.reminder;

import com.elephant.dto.bill.BillDto;
import com.elephant.dto.collab.GroupDto;
import com.elephant.dto.event.EventDto;
import com.elephant.dto.user.UserDto;
import com.elephant.dto.user.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderContextDto {
    private List<BillDto> bills;
    private List<EventDto> events;
    private List<GroupDto> groups;
    private Map<Long, List<UserSummaryDto>> groupMembers;
    private UserDto currentUser;
}
