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

import com.wipro.ecom.dtos.ProductDTO;
import com.wipro.ecom.entities.Category;
import com.wipro.ecom.entities.Product;
import com.wipro.ecom.repository.CategoryRepository;
import com.wipro.ecom.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepo;
    @Mock
    private CategoryRepository categoryRepo;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Veg");

        product = new Product();
        product.setId(100L);
        product.setName("Margherita");
        product.setPrice(300);
        product.setSize("Medium");
        product.setDescription("Classic cheese pizza");
        product.setCategory(category);
    }

    @Test
    void testAddProduct_Success() {
        when(categoryRepo.findByName("Veg")).thenReturn(Optional.of(category));
        when(productRepo.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        ProductDTO dto = new ProductDTO();
        dto.setName("Margherita");
        dto.setPrice(300);
        dto.setSize("Medium");
        dto.setDescription("Classic cheese pizza");
        dto.setCategoryName("Veg");

        ProductDTO result = productService.addProduct(dto);

        assertEquals("Margherita", result.getName());
        assertEquals(300, result.getPrice());
        assertEquals("Veg", result.getCategoryName());
    }

    @Test
    void testAddProduct_CategoryNotFound() {
        when(categoryRepo.findByName("NonExistent")).thenReturn(Optional.empty());

        ProductDTO dto = new ProductDTO();
        dto.setCategoryName("NonExistent");

        assertThrows(RuntimeException.class, () -> productService.addProduct(dto));
    }
}
