package com.elephant.dto.collab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDetailDto {
    private GroupDto group;
    private List<GroupMemberDto> members;
    private List<GroupBillDto> sharedBills;
    private List<GroupEventDto> sharedEvents;
    private List<MemberContributionResponseDto> contributions;
    private List<GroupActivityDto> activities;
}
