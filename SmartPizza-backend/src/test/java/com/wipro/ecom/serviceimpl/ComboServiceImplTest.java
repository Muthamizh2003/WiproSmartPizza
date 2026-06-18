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

import com.wipro.ecom.dtos.ComboDTO;
import com.wipro.ecom.dtos.ComboRequestDTO;
import com.wipro.ecom.entities.Category;
import com.wipro.ecom.entities.Product;
import com.wipro.ecom.external.AzureAIService;
import com.wipro.ecom.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ComboServiceImplTest {

    @Mock
    private ProductRepository productRepo;
    @Mock
    private AzureAIService azureService;

    @InjectMocks
    private ComboServiceImpl comboService;

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

        Product p4 = new Product();
        p4.setId(4L);
        p4.setName("Pepperoni");
        p4.setPrice(450);
        p4.setCategory(cat);

        products = List.of(p1, p2, p3, p4);
    }

    @Test
    void testGetSmartCombos_FallbackWhenAiReturnsNull() {
        when(productRepo.findAll()).thenReturn(products);
        when(productRepo.findTop5ByOrderByPriceDesc())
                .thenReturn(List.of(products.get(3), products.get(2), products.get(1)));
        when(productRepo.findTop5ByOrderByPriceAsc())
                .thenReturn(List.of(products.get(0), products.get(1), products.get(2)));
        when(productRepo.getRandomProducts()).thenReturn(products);

        ComboRequestDTO request = new ComboRequestDTO();
        request.setPrompt("Suggest combos under 500");

        List<ComboDTO> result = comboService.getSmartCombos(request);

        assertEquals(3, result.size());
        assertTrue(result.stream().anyMatch(c -> c.getComboName().contains("Premium")));
        assertTrue(result.stream().anyMatch(c -> c.getComboName().contains("Budget")));
        assertTrue(result.stream().anyMatch(c -> c.getComboName().contains("Surprise")));
    }
}
