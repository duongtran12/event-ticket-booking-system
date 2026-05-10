package com.duong.eventticket.repository;

import com.duong.eventticket.entity.Role;
import com.duong.eventticket.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

}