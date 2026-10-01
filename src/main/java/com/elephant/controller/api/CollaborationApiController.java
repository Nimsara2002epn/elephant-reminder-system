package com.elephant.controller.api;

import com.elephant.dto.collab.*;
import com.elephant.dto.user.UserSummaryDto;
import com.elephant.model.*;
import com.elephant.service.BillService;
import com.elephant.service.EventService;
import com.elephant.service.GroupService;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/collaboration")
public class CollaborationApiController {

    @Autowired private GroupService groupService;
    @Autowired private UserService userService;
    @Autowired private BillService billService;
    @Autowired private EventService eventService;

    private User currentUser() { return userService.getCurrentUser(); }


    @GetMapping
    public ResponseEntity<List<GroupDto>> list() {
        User user = currentUser();
        return ResponseEntity.ok(
                groupService.findGroupsForUser(user).stream()
                        .map(GroupDto::from)
                        .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<GroupDto> create(@RequestBody Map<String, String> body) {
        User user = currentUser();
        SharedGroup group = groupService.createGroup(body.get("name"), body.get("description"), user);
        return ResponseEntity.ok(GroupDto.from(group));
    }


    @GetMapping("/{id}")
    public ResponseEntity<GroupDetailDto> detail(@PathVariable Long id) {
        User user = currentUser();
        SharedGroup group = groupService.findById(id)
                .filter(g -> groupService.isMember(g, user))
                .orElseThrow(() -> new RuntimeException("Group not found or access denied"));

        List<GroupMemberDto> members = groupService.getMembers(group).stream()
                .map(GroupMemberDto::from).collect(Collectors.toList());

        List<GroupBillDto> sharedBills = groupService.getGroupBills(group).stream()
                .map(GroupBillDto::from).collect(Collectors.toList());

        List<GroupEventDto> sharedEvents = groupService.getGroupEvents(group).stream()
                .map(GroupEventDto::from).collect(Collectors.toList());

        List<MemberContributionResponseDto> contributions = groupService.calculateContributions(group).stream()
                .map(MemberContributionResponseDto::from).collect(Collectors.toList());

        List<GroupActivityDto> activities = groupService.getActivities(group).stream()
                .map(GroupActivityDto::from).collect(Collectors.toList());

        return ResponseEntity.ok(new GroupDetailDto(
                GroupDto.from(group), members, sharedBills, sharedEvents, contributions, activities));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        groupService.deleteGroup(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully."));
    }


    @PostMapping("/{id}/members")
    public ResponseEntity<Map<String, String>> addMember(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        User performer = currentUser();
        SharedGroup group = groupService.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User newMember = null;
        if (body.get("userId") != null && !String.valueOf(body.get("userId")).isBlank()) {
            Long userId = Long.valueOf(String.valueOf(body.get("userId")));
            newMember = userService.findById(userId).orElse(null);
        } else if (body.get("email") != null && !String.valueOf(body.get("email")).isBlank()) {
            newMember = userService.findByEmail(String.valueOf(body.get("email"))).orElse(null);
        }

        if (newMember == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        String responsibility = (String) body.getOrDefault("responsibility", "Member");

        groupService.addMember(group, newMember, responsibility, performer);
        return ResponseEntity.ok(Map.of("message", newMember.getName() + " added to the group."));
    }

    @PutMapping("/{id}/members/{memberId}")
    public ResponseEntity<Map<String, String>> updateResponsibility(
            @PathVariable Long id,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> body) {

        groupService.updateResponsibility(memberId, body.get("responsibility"), currentUser());
        return ResponseEntity.ok(Map.of("message", "Responsibility updated."));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {

        User performer = currentUser();
        SharedGroup group = groupService.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User member = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        groupService.removeMember(group, member, performer);
        return ResponseEntity.ok(Map.of("message", member.getName() + " removed from the group."));
    }


    @PostMapping("/{id}/bills")
    public ResponseEntity<GroupBillDto> assignBill(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        User performer = currentUser();
        SharedGroup group = groupService.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Long billId = Long.valueOf(String.valueOf(body.get("billId")));
        Bill bill = billService.findByIdAndUser(billId, performer);

        User assignedTo = null;
        if (body.get("assignedToUserId") != null && !String.valueOf(body.get("assignedToUserId")).isBlank()) {
            Long assignedId = Long.valueOf(String.valueOf(body.get("assignedToUserId")));
            assignedTo = userService.findById(assignedId).orElse(null);
        }

        BigDecimal contribution = null;
        if (body.get("contribution") != null && !String.valueOf(body.get("contribution")).isBlank()) {
            contribution = new BigDecimal(String.valueOf(body.get("contribution")));
        }

        GroupBill saved = groupService.assignBill(group, bill, assignedTo, contribution, performer);
        return ResponseEntity.ok(GroupBillDto.from(saved));
    }

    @DeleteMapping("/{id}/bills/{groupBillId}")
    public ResponseEntity<Map<String, String>> unassignBill(
            @PathVariable Long id,
            @PathVariable Long groupBillId) {
        groupService.unassignBill(id, groupBillId, currentUser());
        return ResponseEntity.ok(Map.of("message", "Bill removed from group."));
    }


    @PostMapping("/{id}/events")
    public ResponseEntity<GroupEventDto> assignEvent(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        User performer = currentUser();
        SharedGroup group = groupService.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Long eventId = Long.valueOf(String.valueOf(body.get("eventId")));
        Event event = eventService.findByIdAndUser(eventId, performer);

        User assignedTo = null;
        if (body.get("assignedToUserId") != null && !String.valueOf(body.get("assignedToUserId")).isBlank()) {
            Long assignedId = Long.valueOf(String.valueOf(body.get("assignedToUserId")));
            assignedTo = userService.findById(assignedId).orElse(null);
        }

        String notes = (String) body.get("notes");

        GroupEvent saved = groupService.assignEvent(group, event, assignedTo, notes, performer);
        return ResponseEntity.ok(GroupEventDto.from(saved));
    }

    @DeleteMapping("/{id}/events/{groupEventId}")
    public ResponseEntity<Map<String, String>> unassignEvent(
            @PathVariable Long id,
            @PathVariable Long groupEventId) {
        groupService.unassignEvent(id, groupEventId, currentUser());
        return ResponseEntity.ok(Map.of("message", "Event removed from group."));
    }


    @GetMapping("/{id}/contributions")
    public ResponseEntity<List<MemberContributionResponseDto>> contributions(@PathVariable Long id) {
        User user = currentUser();
        SharedGroup group = groupService.findById(id)
                .filter(g -> groupService.isMember(g, user))
                .orElseThrow(() -> new RuntimeException("Group not found or access denied"));

        return ResponseEntity.ok(
                groupService.calculateContributions(group).stream()
                        .map(MemberContributionResponseDto::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<List<GroupActivityDto>> activities(@PathVariable Long id) {
        User user = currentUser();
        SharedGroup group = groupService.findById(id)
                .filter(g -> groupService.isMember(g, user))
                .orElseThrow(() -> new RuntimeException("Group not found or access denied"));

        return ResponseEntity.ok(
                groupService.getActivities(group).stream()
                        .map(GroupActivityDto::from)
                        .collect(Collectors.toList()));
    }


    @GetMapping("/users/search")
    public ResponseEntity<List<UserSummaryDto>> searchUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers().stream()
                        .map(UserSummaryDto::from)
                        .collect(Collectors.toList()));
    }
}
