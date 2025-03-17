package com.example.base.controller;

import com.example.base.entity.ChallengeGroupMember;
import com.example.base.entity.ChallengeResult;
import com.example.base.entity.TierList;
import com.example.base.entity.User;
import com.example.base.repository.ChallengeGroupMemberRepository;
import com.example.base.repository.ChallengeResultRepository;
import com.example.base.repository.TierListRepository;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/challenge-group-members")
public class ChallengeGroupMemberController {

    @Autowired
    private ChallengeGroupMemberRepository challengeGroupMemberRepository;
    
    @Autowired
    private ChallengeResultRepository challengeResultRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TierListRepository tierListRepository;

    // Get all challenge group members
    @GetMapping
    public ResponseEntity<List<ChallengeGroupMember>> getAllChallengeGroupMembers() {
        try {
            List<ChallengeGroupMember> members = challengeGroupMemberRepository.findAll();
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge group member by ID
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeGroupMember> getChallengeGroupMemberById(@PathVariable("id") Long id) {
        Optional<ChallengeGroupMember> memberData = challengeGroupMemberRepository.findById(id);
        
        if (memberData.isPresent()) {
            return new ResponseEntity<>(memberData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get challenge group members by result ID
    @GetMapping("/result/{resultId}")
    public ResponseEntity<List<ChallengeGroupMember>> getChallengeGroupMembersByResultId(@PathVariable("resultId") Long resultId) {
        try {
            List<ChallengeGroupMember> members = challengeGroupMemberRepository.findByResultResultId(resultId);
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge group members by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChallengeGroupMember>> getChallengeGroupMembersByUserId(@PathVariable("userId") Long userId) {
        try {
            List<ChallengeGroupMember> members = challengeGroupMemberRepository.findByUserUserId(userId);
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge group members by tierlist ID
    @GetMapping("/tierlist/{tierlistId}")
    public ResponseEntity<List<ChallengeGroupMember>> getChallengeGroupMembersByTierlistId(@PathVariable("tierlistId") Long tierlistId) {
        try {
            List<ChallengeGroupMember> members = challengeGroupMemberRepository.findByTierListTierlistId(tierlistId);
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge group members by week number and year
    @GetMapping("/week/{weekNumber}/year/{year}")
    public ResponseEntity<List<ChallengeGroupMember>> getChallengeGroupMembersByWeekAndYear(
            @PathVariable("weekNumber") Integer weekNumber,
            @PathVariable("year") Integer year) {
        try {
            List<ChallengeGroupMember> members = challengeGroupMemberRepository.findByResultChallengeWeekNumberAndResultChallengeYear(weekNumber, year);
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a new challenge group member
    @PostMapping
    public ResponseEntity<ChallengeGroupMember> createChallengeGroupMember(@RequestBody ChallengeGroupMember challengeGroupMember) {
        try {
            // Validate challenge result exists
            if (challengeGroupMember.getResult() != null && challengeGroupMember.getResult().getResultId() != null) {
                Optional<ChallengeResult> resultData = challengeResultRepository.findById(challengeGroupMember.getResult().getResultId());
                if (!resultData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                challengeGroupMember.setResult(resultData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate user exists
            if (challengeGroupMember.getUser() != null && challengeGroupMember.getUser().getUserId() != null) {
                Optional<User> userData = userRepository.findById(challengeGroupMember.getUser().getUserId());
                if (!userData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                challengeGroupMember.setUser(userData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate tierlist exists
            if (challengeGroupMember.getTierList() != null && challengeGroupMember.getTierList().getTierlistId() != null) {
                Optional<TierList> tierListData = tierListRepository.findById(challengeGroupMember.getTierList().getTierlistId());
                if (!tierListData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                challengeGroupMember.setTierList(tierListData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            ChallengeGroupMember savedMember = challengeGroupMemberRepository.save(challengeGroupMember);
            return new ResponseEntity<>(savedMember, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a challenge group member
    @PutMapping("/{id}")
    public ResponseEntity<ChallengeGroupMember> updateChallengeGroupMember(@PathVariable("id") Long id, @RequestBody ChallengeGroupMember challengeGroupMember) {
        Optional<ChallengeGroupMember> memberData = challengeGroupMemberRepository.findById(id);
        
        if (memberData.isPresent()) {
            ChallengeGroupMember existingMember = memberData.get();
            
            // Update result if provided
            if (challengeGroupMember.getResult() != null && challengeGroupMember.getResult().getResultId() != null) {
                Optional<ChallengeResult> resultData = challengeResultRepository.findById(challengeGroupMember.getResult().getResultId());
                if (resultData.isPresent()) {
                    existingMember.setResult(resultData.get());
                }
            }
            
            // Update user if provided
            if (challengeGroupMember.getUser() != null && challengeGroupMember.getUser().getUserId() != null) {
                Optional<User> userData = userRepository.findById(challengeGroupMember.getUser().getUserId());
                if (userData.isPresent()) {
                    existingMember.setUser(userData.get());
                }
            }
            
            // Update tierlist if provided
            if (challengeGroupMember.getTierList() != null && challengeGroupMember.getTierList().getTierlistId() != null) {
                Optional<TierList> tierListData = tierListRepository.findById(challengeGroupMember.getTierList().getTierlistId());
                if (tierListData.isPresent()) {
                    existingMember.setTierList(tierListData.get());
                }
            }
            
            return new ResponseEntity<>(challengeGroupMemberRepository.save(existingMember), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a challenge group member
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteChallengeGroupMember(@PathVariable("id") Long id) {
        try {
            challengeGroupMemberRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all members for a result
    @DeleteMapping("/result/{resultId}")
    public ResponseEntity<HttpStatus> deleteAllMembersForResult(@PathVariable("resultId") Long resultId) {
        try {
            challengeGroupMemberRepository.deleteByResultResultId(resultId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 