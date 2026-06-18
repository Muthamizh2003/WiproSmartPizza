package com.wipro.ecom.serviceimpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.wipro.ecom.dtos.UserDTO;
import com.wipro.ecom.entities.Role;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.repository.RoleRepository;
import com.wipro.ecom.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepo;
    @Mock
    private RoleRepository roleRepo;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private Role userRole;

    @BeforeEach
    void setUp() {
        userRole = new Role(1L, "USER");
    }

    @Test
    void testRegister_Success() {
        when(userRepo.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(roleRepo.findByName("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encoded");
        when(userRepo.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            u.setRoles(Set.of(userRole));
            return u;
        });

        UserDTO dto = new UserDTO();
        dto.setName("New User");
        dto.setEmail("new@example.com");
        dto.setPassword("password123");
        dto.setMobile("9876543210");

        UserDTO result = userService.register(dto);

        assertEquals("New User", result.getName());
        assertEquals("new@example.com", result.getEmail());
        assertTrue(result.getRoles().contains("USER"));
    }

    @Test
    void testRegister_DuplicateEmail() {
        when(userRepo.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        UserDTO dto = new UserDTO();
        dto.setEmail("existing@example.com");

        assertThrows(RuntimeException.class, () -> userService.register(dto));
    }
}
