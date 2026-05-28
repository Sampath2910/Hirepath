package com.hirepath.ai.controller;

import com.hirepath.ai.model.User;
import com.hirepath.ai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:3000}")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        // Hash password before saving in real app
        user.setPlanType(User.PlanType.FREE);
        user.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User loginUser) {
        return userRepository.findByEmail(loginUser.getEmail())
                .filter(u -> u.getPasswordHash() != null && u.getPasswordHash().equals(loginUser.getPasswordHash()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<User> getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
