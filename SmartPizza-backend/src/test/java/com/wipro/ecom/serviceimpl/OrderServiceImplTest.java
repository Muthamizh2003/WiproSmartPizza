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

import com.wipro.ecom.dtos.OrderDTO;
import com.wipro.ecom.entities.Address;
import com.wipro.ecom.entities.CartItem;
import com.wipro.ecom.entities.Coupon;
import com.wipro.ecom.entities.Order;
import com.wipro.ecom.entities.Product;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.enumpackage.DiscountType;
import com.wipro.ecom.repository.AddressRepository;
import com.wipro.ecom.repository.CartItemRepository;
import com.wipro.ecom.repository.CouponRepository;
import com.wipro.ecom.repository.DeliveryRepository;
import com.wipro.ecom.repository.OrderItemRepository;
import com.wipro.ecom.repository.OrderRepository;
import com.wipro.ecom.repository.ProductRepository;
import com.wipro.ecom.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepo;
    @Mock
    private OrderItemRepository orderItemRepo;
    @Mock
    private AddressRepository addressRepo;
    @Mock
    private CartItemRepository cartRepo;
    @Mock
    private DeliveryRepository deliveryRepo;
    @Mock
    private ProductRepository productRepo;
    @Mock
    private UserRepository userRepo;
    @Mock
    private CouponRepository couponRepo;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User user;
    private Address address;
    private Product product;
    private CartItem cartItem;
    private Coupon coupon;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setBlocked(false);

        address = new Address();
        address.setId(10L);
        address.setCity("Mumbai");

        product = new Product();
        product.setId(100L);
        product.setName("Margherita");
        product.setPrice(300);

        cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);

        coupon = new Coupon();
        coupon.setId(1L);
        coupon.setCode("FLAT50");
        coupon.setDiscount(50);
        coupon.setType(DiscountType.FLAT);
        coupon.setMinOrderAmount(100);
        coupon.setExpiryDate(LocalDateTime.now().plusDays(10));
    }

    @Test
    void testPlaceOrder_WithFlatCoupon() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(addressRepo.findById(10L)).thenReturn(Optional.of(address));
        when(cartRepo.findByUserId(1L)).thenReturn(List.of(cartItem));
        when(couponRepo.findByCode("FLAT50")).thenReturn(Optional.of(coupon));
        when(orderRepo.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(200L);
            return o;
        });

        OrderDTO result = orderService.placeOrder(1L, 10L, "FLAT50");

        assertNotNull(result);
        verify(orderItemRepo).saveAll(anyList());
        verify(cartRepo).deleteByUserId(1L);

        double expectedAfterDiscount = 600.0 - 50.0; // 550
        double expectedTax = 55.0;
        double expectedTotal = 605.0;
        assertEquals(expectedTotal, result.getTotalAmount(), 0.01);
        assertEquals(200L, result.getId());
        assertEquals("PENDING_PAYMENT", result.getStatus());
    }
}
