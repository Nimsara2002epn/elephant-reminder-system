package com.elephant.service;

import com.elephant.dto.MemberContributionDTO;
import com.elephant.model.*;
import com.elephant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GroupService {

    @Autowired private SharedGroupRepository groupRepository;
    @Autowired private GroupMemberRepository memberRepository;
    @Autowired private GroupBillRepository groupBillRepository;
    @Autowired private GroupEventRepository groupEventRepository;
    @Autowired private GroupActivityRepository groupActivityRepository;

    public void logActivity(SharedGroup group, User user, String action) {
        GroupActivity activity = new GroupActivity();
        activity.setGroup(group);
        activity.setUser(user);
        activity.setAction(action);
        groupActivityRepository.save(activity);
    }

    public SharedGroup createGroup(String name, String description, User creator) {
        SharedGroup group = new SharedGroup();
        group.setName(name);
        group.setDescription(description);
        group.setCreator(creator);
        group = groupRepository.save(group);

        GroupMember ownerMember = new GroupMember();
        ownerMember.setGroup(group);
        ownerMember.setUser(creator);
        ownerMember.setRole("OWNER");
        ownerMember.setResponsibility("Group Creator / Admin");
        memberRepository.save(ownerMember);

        logActivity(group, creator, "Created the group '" + name + "'");

        return group;
    }

    public Optional<SharedGroup> findById(Long id) {
        return groupRepository.findById(id);
    }

    public List<SharedGroup> findGroupsForUser(User user) {
        return groupRepository.findAllGroupsForUser(user);
    }

    public void addMember(SharedGroup group, User user, String responsibility, User performedBy) {
        if (!memberRepository.existsByGroupAndUser(group, user)) {
            GroupMember member = new GroupMember();
            member.setGroup(group);
            member.setUser(user);
            member.setRole("MEMBER");
            member.setResponsibility(responsibility != null && !responsibility.isBlank() ? responsibility : "Member");
            memberRepository.save(member);

            String roleInfo = (responsibility != null && !responsibility.isBlank()) ? " (" + responsibility + ")" : "";
            logActivity(group, performedBy, "Added member " + user.getName() + roleInfo);
        }
    }

    public void updateResponsibility(Long memberId, String responsibility, User performedBy) {
        memberRepository.findById(memberId).ifPresent(m -> {
            m.setResponsibility(responsibility);
            memberRepository.save(m);

            logActivity(m.getGroup(), performedBy, "Updated responsibility for " + m.getUser().getName() + " to '" + responsibility + "'");
        });
    }

    public void removeMember(SharedGroup group, User user, User performedBy) {
        memberRepository.deleteByGroupAndUser(group, user);
        logActivity(group, performedBy, "Removed member " + user.getName());
    }

    public void deleteGroup(Long groupId, User user) {
        SharedGroup group = groupRepository.findById(groupId)
                .filter(g -> "ADMIN".equals(user.getRole()) || g.getCreator().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Group not found or you are not the owner"));

        memberRepository.deleteAll(memberRepository.findByGroup(group));
        groupBillRepository.deleteAll(groupBillRepository.findByGroup(group));
        groupEventRepository.deleteAll(groupEventRepository.findByGroup(group));
        groupActivityRepository.deleteAll(groupActivityRepository.findByGroup(group));
        groupRepository.delete(group);
    }

    public void unassignBill(Long groupId, Long groupBillId, User performedBy) {
        groupBillRepository.findById(groupBillId).ifPresent(gb -> {
            if (gb.getGroup().getId().equals(groupId)) {
                logActivity(gb.getGroup(), performedBy, "Removed bill '" + gb.getBill().getTitle() + "' from group");
                groupBillRepository.delete(gb);
            }
        });
    }

    public void unassignEvent(Long groupId, Long groupEventId, User performedBy) {
        groupEventRepository.findById(groupEventId).ifPresent(ge -> {
            if (ge.getGroup().getId().equals(groupId)) {
                logActivity(ge.getGroup(), performedBy, "Removed event '" + ge.getEvent().getTitle() + "' from group");
                groupEventRepository.delete(ge);
            }
        });
    }

    public GroupBill assignBill(SharedGroup group, Bill bill, User assignedTo, BigDecimal contribution, User performedBy) {
        if (groupBillRepository.existsByGroupAndBill(group, bill)) {
            throw new IllegalArgumentException("This bill ('" + bill.getTitle() + "') is already assigned to this group.");
        }

        GroupBill gb = new GroupBill();
        gb.setGroup(group);
        gb.setBill(bill);
        gb.setAssignedTo(assignedTo);
        gb.setContribution(contribution != null ? contribution : bill.getAmount());
        GroupBill saved = groupBillRepository.save(gb);

        String assignInfo = assignedTo != null ? " to " + assignedTo.getName() : " to the group";
        logActivity(group, performedBy, "Assigned bill '" + bill.getTitle() + "' (LKR " + bill.getAmount() + ")" + assignInfo);

        return saved;
    }

    public GroupEvent assignEvent(SharedGroup group, Event event, User assignedTo, String notes, User performedBy) {
        if (groupEventRepository.existsByGroupAndEvent(group, event)) {
            throw new IllegalArgumentException("This event ('" + event.getTitle() + "') is already assigned to this group.");
        }

        GroupEvent ge = new GroupEvent();
        ge.setGroup(group);
        ge.setEvent(event);
        ge.setAssignedTo(assignedTo);
        ge.setNotes(notes);
        GroupEvent saved = groupEventRepository.save(ge);

        String assignInfo = assignedTo != null ? " to " + assignedTo.getName() : " to the group";
        logActivity(group, performedBy, "Assigned event '" + event.getTitle() + "'" + assignInfo);

        return saved;
    }

    public List<GroupBill> getGroupBills(SharedGroup group) {
        return groupBillRepository.findByGroup(group);
    }

    public List<GroupEvent> getGroupEvents(SharedGroup group) {
        return groupEventRepository.findByGroup(group);
    }

    public List<GroupMember> getMembers(SharedGroup group) {
        return memberRepository.findByGroup(group);
    }

    public boolean isMember(SharedGroup group, User user) {
        return memberRepository.existsByGroupAndUser(group, user);
    }

    public List<GroupActivity> getActivities(SharedGroup group) {
        return groupActivityRepository.findByGroupOrderByTimestampDesc(group);
    }

    public List<MemberContributionDTO> calculateContributions(SharedGroup group) {
        List<GroupMember> members = memberRepository.findByGroup(group);
        List<GroupBill> bills = groupBillRepository.findByGroup(group);

        List<MemberContributionDTO> dtoList = new ArrayList<>();

        for (GroupMember member : members) {
            User user = member.getUser();
            long assignedCount = 0;
            BigDecimal paid = BigDecimal.ZERO;
            BigDecimal outstanding = BigDecimal.ZERO;

            for (GroupBill gb : bills) {
                if (gb.getAssignedTo() != null && gb.getAssignedTo().getId().equals(user.getId())) {
                    assignedCount++;
                    BigDecimal amt = gb.getContribution() != null ? gb.getContribution() : gb.getBill().getAmount();
                    if (amt != null) {
                        if (gb.getBill().getStatus() == Bill.BillStatus.PAID) {
                            paid = paid.add(amt);
                        } else {
                            outstanding = outstanding.add(amt);
                        }
                    }
                }
            }

            String resp = member.getResponsibility() != null ? member.getResponsibility() : member.getRole();
            dtoList.add(new MemberContributionDTO(user, assignedCount, paid, outstanding, resp));
        }

        return dtoList;
    }
}
