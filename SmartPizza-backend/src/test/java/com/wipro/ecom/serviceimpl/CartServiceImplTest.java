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

import com.wipro.ecom.entities.CartItem;
import com.wipro.ecom.entities.Product;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.repository.CartItemRepository;
import com.wipro.ecom.repository.ProductRepository;
import com.wipro.ecom.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartItemRepository cartRepo;
    @Mock
    private ProductRepository productRepo;
    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private CartServiceImpl cartService;

    private User user;
    private Product product;
    private CartItem existingItem;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        product = new Product();
        product.setId(100L);
        product.setName("Margherita");
        product.setPrice(300);

        existingItem = new CartItem();
        existingItem.setId(10L);
        existingItem.setUser(user);
        existingItem.setProduct(product);
        existingItem.setQuantity(2);
    }

    @Test
    void testAddToCart_ExistingItemIncrementsQuantity() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(productRepo.findById(100L)).thenReturn(Optional.of(product));
        when(cartRepo.findByUser_IdAndProduct_Id(1L, 100L)).thenReturn(Optional.of(existingItem));

        cartService.addToCart(1L, 100L, 3);

        assertEquals(5, existingItem.getQuantity());
        verify(cartRepo).save(existingItem);
    }

    @Test
    void testAddToCart_NewItem() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(productRepo.findById(100L)).thenReturn(Optional.of(product));
        when(cartRepo.findByUser_IdAndProduct_Id(1L, 100L)).thenReturn(Optional.empty());

        cartService.addToCart(1L, 100L, 3);

        verify(cartRepo).save(any(CartItem.class));
    }
}
