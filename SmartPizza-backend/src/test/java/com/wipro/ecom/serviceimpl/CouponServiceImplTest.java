package com.wipro.ecom.serviceimpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wipro.ecom.dtos.CouponResponseDTO;
import com.wipro.ecom.entities.Coupon;
import com.wipro.ecom.enumpackage.DiscountType;
import com.wipro.ecom.repository.CouponRepository;

@ExtendWith(MockitoExtension.class)
class CouponServiceImplTest {

    @Mock
    private CouponRepository couponRepo;

    @InjectMocks
    private CouponServiceImpl couponService;

    private Coupon flatCoupon;
    private Coupon percentCoupon;

    @BeforeEach
    void setUp() {
        flatCoupon = new Coupon();
        flatCoupon.setId(1L);
        flatCoupon.setCode("FLAT50");
        flatCoupon.setDiscount(50);
        flatCoupon.setType(DiscountType.FLAT);
        flatCoupon.setMinOrderAmount(200);
        flatCoupon.setExpiryDate(LocalDateTime.now().plusDays(10));

        percentCoupon = new Coupon();
        percentCoupon.setId(2L);
        percentCoupon.setCode("PCT10");
        percentCoupon.setDiscount(10);
        percentCoupon.setType(DiscountType.PERCENTAGE);
        percentCoupon.setMinOrderAmount(100);
        percentCoupon.setExpiryDate(LocalDateTime.now().plusDays(10));
    }

    @Test
    void testApplyCoupon_FlatDiscount() {
        when(couponRepo.findByCode("FLAT50")).thenReturn(Optional.of(flatCoupon));

        CouponResponseDTO result = couponService.applyCoupon("FLAT50", 500);

        assertEquals("FLAT50", result.getCode());
        assertEquals(50, result.getDiscountAmount());
        assertEquals(450, result.getFinalAmount());
        assertTrue(result.getMessage().contains("success"));
    }

    @Test
    void testApplyCoupon_PercentageDiscount() {
        when(couponRepo.findByCode("PCT10")).thenReturn(Optional.of(percentCoupon));

        CouponResponseDTO result = couponService.applyCoupon("PCT10", 500);

        assertEquals("PCT10", result.getCode());
        assertEquals(50, result.getDiscountAmount());
        assertEquals(450, result.getFinalAmount());
    }

    @Test
    void testApplyCoupon_InvalidCode() {
        when(couponRepo.findByCode("INVALID")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> couponService.applyCoupon("INVALID", 500));
    }
}
