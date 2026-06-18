package com.wipro.ecom.serviceimpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wipro.ecom.dtos.DeliveryDTO;
import com.wipro.ecom.entities.Address;
import com.wipro.ecom.entities.Delivery;
import com.wipro.ecom.entities.DeliveryAgent;
import com.wipro.ecom.entities.Order;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.external.AzureMapsService;
import com.wipro.ecom.repository.DeliveryAgentRepository;
import com.wipro.ecom.repository.DeliveryRepository;
import com.wipro.ecom.repository.OrderRepository;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepo;
    @Mock
    private OrderRepository orderRepo;
    @Mock
    private DeliveryAgentRepository agentRepo;
    @Mock
    private AzureMapsService mapsService;

    @InjectMocks
    private DeliveryServiceImpl deliveryService;

    private Order order;
    private DeliveryAgent agent;
    private Delivery delivery;
    private Address address;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);

        address = new Address();
        address.setId(10L);
        address.setCity("Mumbai");
        address.setLatitude(19.0760);
        address.setLongitude(72.8777);

        order = new Order();
        order.setId(100L);
        order.setUser(user);
        order.setStatus("CONFIRMED");
        order.setTotalAmount(500);
        order.setDeliveryAddress(address);
        order.setCreatedAt(LocalDateTime.now());

        agent = new DeliveryAgent();
        agent.setId(5L);
        agent.setName("Driver John");
        agent.setAvailable(true);

        delivery = new Delivery();
        delivery.setId(50L);
        delivery.setOrder(order);
        delivery.setAgent(agent);
        delivery.setStatus("OUT_FOR_DELIVERY");
        delivery.setLatitude(13.0827);
        delivery.setLongitude(80.2707);
    }

    @Test
    void testStartDelivery_Success() {
        when(deliveryRepo.findByOrderId(100L)).thenReturn(Optional.empty());
        when(orderRepo.findById(100L)).thenReturn(Optional.of(order));
        when(agentRepo.findAvailableAgent()).thenReturn(List.of(agent));
        when(mapsService.getETA(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(25.5);
        when(deliveryRepo.save(any(Delivery.class))).thenAnswer(inv -> {
            Delivery d = inv.getArgument(0);
            d.setId(50L);
            return d;
        });

        DeliveryDTO result = deliveryService.startDelivery(100L);

        assertEquals("OUT_FOR_DELIVERY", result.getStatus());
        assertEquals("Driver John", result.getAgentName());
        assertFalse(agent.isAvailable());
        assertEquals("OUT_FOR_DELIVERY", order.getStatus());
    }
}
