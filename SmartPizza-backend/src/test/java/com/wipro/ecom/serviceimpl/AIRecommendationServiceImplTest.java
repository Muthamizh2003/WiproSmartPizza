package com.wipro.ecom.serviceimpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.wipro.ecom.dtos.AIRequestDTO;
import com.wipro.ecom.dtos.ProductDTO;
import com.wipro.ecom.dtos.RecommendationDTO;
import com.wipro.ecom.entities.Category;
import com.wipro.ecom.entities.Product;
import com.wipro.ecom.external.AzureAIService;
import com.wipro.ecom.repository.OrderRepository;
import com.wipro.ecom.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class AIRecommendationServiceImplTest {

    @Mock
    private AzureAIService azureService;
    @Mock
    private ProductRepository productRepo;
    @Mock
    private OrderRepository orderRepo;

    @InjectMocks
    private AIRecommendationServiceImpl aiService;

    private List<Product> products;

    @BeforeEach
    void setUp() {
        Category cat = new Category();
        cat.setName("Veg");

        Product p1 = new Product();
        p1.setId(1L);
        p1.setName("Margherita");
        p1.setPrice(300);
        p1.setCategory(cat);

        Product p2 = new Product();
        p2.setId(2L);
        p2.setName("Farm Fresh");
        p2.setPrice(350);
        p2.setCategory(cat);

        Product p3 = new Product();
        p3.setId(3L);
        p3.setName("Cheese Burst");
        p3.setPrice(400);
        p3.setCategory(cat);

        products = List.of(p1, p2, p3);
    }

    @Test
    void testGetRecommendations_FallbackWhenAiReturnsNull() {
        when(orderRepo.findByUserId(1L)).thenReturn(List.of());
        when(productRepo.findAll()).thenReturn(products);

        AIRequestDTO request = new AIRequestDTO();
        request.setUserId(1L);
        request.setPrompt("Suggest combos");

        List<RecommendationDTO> result = aiService.getRecommendations(request);

        assertFalse(result.isEmpty());
        assertEquals("Filtered Combo 🔥", result.get(0).getTitle());
        assertEquals(1050, result.get(0).getTotalPrice());
    }
}
