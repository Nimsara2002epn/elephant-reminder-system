package com.elephant.dto.collab;

import com.elephant.dto.MemberContributionDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
public class MemberContributionResponseDto {
    private Long userId;
    private String name;
    private String email;
    private long assignedBillsCount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private String responsibility;

    public static MemberContributionResponseDto from(MemberContributionDTO dto) {
        MemberContributionResponseDto r = new MemberContributionResponseDto();
        if (dto.getMember() != null) {
            r.userId = dto.getMember().getId();
            r.name = dto.getMember().getName();
            r.email = dto.getMember().getEmail();
        }
        r.assignedBillsCount = dto.getAssignedBillsCount();
        r.paidAmount = dto.getPaidAmount();
        r.outstandingAmount = dto.getOutstandingAmount();
        r.responsibility = dto.getRoleOrResponsibility();
        return r;
    }
}
