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

import com.wipro.ecom.dtos.OrderDTO;
import com.wipro.ecom.entities.Delivery;
import com.wipro.ecom.entities.DeliveryAgent;
import com.wipro.ecom.entities.Order;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.repository.DeliveryAgentRepository;
import com.wipro.ecom.repository.DeliveryRepository;
import com.wipro.ecom.repository.OrderRepository;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceImplTest {

    @Mock
    private OrderRepository orderRepo;
    @Mock
    private DeliveryRepository deliveryRepo;
    @Mock
    private DeliveryAgentRepository agentRepo;

    @InjectMocks
    private AdminDashboardServiceImpl adminService;

    private Order order;
    private DeliveryAgent agent;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");

        order = new Order();
        order.setId(100L);
        order.setUser(user);
        order.setTotalAmount(500);
        order.setStatus("CONFIRMED");

        agent = new DeliveryAgent();
        agent.setId(10L);
        agent.setName("Agent Smith");
        agent.setAvailable(true);
    }

    @Test
    void testAssignAgentToOrder_Success() {
        when(orderRepo.findById(100L)).thenReturn(Optional.of(order));
        when(agentRepo.findById(10L)).thenReturn(Optional.of(agent));
        when(deliveryRepo.findByOrderId(100L)).thenReturn(Optional.empty());
        when(orderRepo.save(order)).thenReturn(order);
        when(deliveryRepo.save(any(Delivery.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDTO result = adminService.assignAgentToOrder(100L, 10L);

        assertEquals("OUT_FOR_DELIVERY", result.getStatus());
        assertFalse(agent.isAvailable());
    }
}
