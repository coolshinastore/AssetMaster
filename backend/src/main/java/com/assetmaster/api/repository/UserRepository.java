package com.assetmaster.api.repository;

import com.assetmaster.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(nativeQuery = true, value = """
            SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS new_users
            FROM users
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 12
            """)
    List<Object[]> findMonthlyRegistrations();
}
