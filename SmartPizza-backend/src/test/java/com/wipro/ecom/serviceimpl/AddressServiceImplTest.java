package com.wipro.ecom.serviceimpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.wipro.ecom.dtos.AddressDTO;
import com.wipro.ecom.entities.Address;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.external.AzureMapsService;
import com.wipro.ecom.repository.AddressRepository;
import com.wipro.ecom.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AddressServiceImplTest {

    @Mock
    private AddressRepository addressRepo;
    @Mock
    private UserRepository userRepo;
    @Mock
    private AzureMapsService mapsService;

    @InjectMocks
    private AddressServiceImpl addressService;

    private User user;
    private Address address;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");

        address = new Address();
        address.setId(10L);
        address.setStreet("123 Main St");
        address.setCity("Mumbai");
        address.setState("Maharashtra");
        address.setPincode("400001");
        address.setUser(user);
        address.setLatitude(19.0760);
        address.setLongitude(72.8777);
    }

    @Test
    void testAddAddress_Success() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("test@example.com");
        doReturn(java.util.List.of(new SimpleGrantedAuthority("ROLE_USER"))).when(auth).getAuthorities();

        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);

        try (var mocked = mockStatic(SecurityContextHolder.class)) {
            mocked.when(SecurityContextHolder::getContext).thenReturn(ctx);

            when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(userRepo.findById(1L)).thenReturn(Optional.of(user));
            when(mapsService.getCoordinates(anyString())).thenReturn(new double[]{19.0760, 72.8777});
            when(addressRepo.save(any(Address.class))).thenAnswer(inv -> {
                Address a = inv.getArgument(0);
                a.setId(10L);
                return a;
            });

            AddressDTO dto = new AddressDTO();
            dto.setStreet("123 Main St");
            dto.setCity("Mumbai");
            dto.setState("Maharashtra");
            dto.setPincode("400001");

            AddressDTO result = addressService.addAddress(1L, dto);

            assertEquals("Mumbai", result.getCity());
            assertEquals("Maharashtra", result.getState());
            assertEquals(19.0760, result.getLatitude(), 0.001);
        }
    }
}
