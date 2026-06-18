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

import com.wipro.ecom.dtos.PaymentDTO;
import com.wipro.ecom.entities.Order;
import com.wipro.ecom.entities.Payment;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.repository.OrderRepository;
import com.wipro.ecom.repository.PaymentRepository;
import com.wipro.ecom.services.DeliveryService;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepo;
    @Mock
    private OrderRepository orderRepo;
    @Mock
    private DeliveryService deliveryService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Order order;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);
        user.setUsername("john");

        order = new Order();
        order.setId(100L);
        order.setUser(user);
        order.setTotalAmount(500);
        order.setStatus("PENDING_PAYMENT");
    }

    @Test
    void testProcessPayment_Success() {
        when(orderRepo.findById(100L)).thenReturn(Optional.of(order));
        when(paymentRepo.findByOrderId(100L)).thenReturn(Optional.empty());
        when(paymentRepo.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(50L);
            return p;
        });

        PaymentDTO dto = new PaymentDTO();
        dto.setOrderId(100L);
        dto.setPaymentMethod("CASH");

        PaymentDTO result = paymentService.processPayment(dto);

        assertEquals("SUCCESS", result.getStatus());
        assertEquals("CASH", result.getPaymentMethod());
        assertEquals(500, result.getAmount());
        assertEquals("CONFIRMED", order.getStatus());
    }
}
