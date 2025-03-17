package com.example.base.repository;

import com.example.base.entity.ChallengeGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeGroupMemberRepository extends JpaRepository<ChallengeGroupMember, Long> {
    
    List<ChallengeGroupMember> findByResultResultId(Long resultId);
    
    List<ChallengeGroupMember> findByUserUserId(Long userId);
    
    List<ChallengeGroupMember> findByTierListTierlistId(Long tierlistId);
    
    List<ChallengeGroupMember> findByResultChallengeWeekNumberAndResultChallengeYear(Integer weekNumber, Integer year);
    
    void deleteByResultResultId(Long resultId);
} 