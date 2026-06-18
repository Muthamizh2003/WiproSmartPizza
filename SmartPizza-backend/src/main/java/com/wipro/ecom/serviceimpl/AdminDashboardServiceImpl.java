package com.wipro.ecom.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wipro.ecom.dtos.AddressDTO;
import com.wipro.ecom.dtos.CustomerAnalyticsDTO;
import com.wipro.ecom.dtos.CustomerTrendDTO;
import com.wipro.ecom.dtos.DailyOrderDTO;
import com.wipro.ecom.dtos.DeliveryAnalyticsDTO;
import com.wipro.ecom.dtos.DeliveryPerformanceDTO;
import com.wipro.ecom.dtos.HeatmapDTO;
import com.wipro.ecom.dtos.OrderAnalyticsDTO;
import com.wipro.ecom.dtos.OrderDTO;
import com.wipro.ecom.dtos.OrderItemDTO;
import com.wipro.ecom.dtos.ProductDTO;
import com.wipro.ecom.dtos.RevenueDTO;
import com.wipro.ecom.entities.Delivery;
import com.wipro.ecom.entities.DeliveryAgent;
import com.wipro.ecom.entities.Order;
import com.wipro.ecom.entities.Product;
import com.wipro.ecom.entities.User;
import com.wipro.ecom.repository.DeliveryAgentRepository;
import com.wipro.ecom.repository.DeliveryRepository;
import com.wipro.ecom.repository.OrderRepository;
import com.wipro.ecom.repository.PaymentRepository;
import com.wipro.ecom.repository.ProductRepository;
import com.wipro.ecom.repository.UserRepository;
import com.wipro.ecom.services.AdminDashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

	@Autowired
    private OrderRepository orderRepo;
	
	@Autowired
    private DeliveryRepository deliveryRepo;
    
	@Autowired
    private ProductRepository productRepo;
	
	@Autowired
    private UserRepository userRepo;
	
	@Autowired
	private PaymentRepository paymentRepo;
	
	@Autowired
	private DeliveryAgentRepository agentRepo;
	
	private static final Logger log = LoggerFactory.getLogger(AdminDashboardServiceImpl.class);
	
	private static final double SHOP_LAT = 13.0827;
	private static final double SHOP_LNG = 80.2707;
	
    //REVENUE
    @Override
    public RevenueDTO getRevenueAnalytics() {

    	log.info("Fetching revenue analytics");
    	
        RevenueDTO dto = new RevenueDTO();

        Double total = paymentRepo.getTotalRevenue();
        
        dto.setTotalRevenue(total != null ? total : 0.0);
        
        Double today = paymentRepo.getTodayRevenue();

        dto.setDailyRevenue(today != null ? today : 0.0);
        
        log.debug("Total Revenue: {}, Daily Revenue: {}", total, today);
        
        return dto;
    }

    // ✅ ORDER ANALYTICS
    @Override
    public OrderAnalyticsDTO getOrderAnalytics() {

        OrderAnalyticsDTO dto = new OrderAnalyticsDTO();

        dto.setStatusCounts(orderRepo.getOrderStatusCount());
        dto.setTotalOrders(
                orderRepo.count()
        );

        return dto;
    }

    //DELIVERY ANALYTICS
    @Override
    public DeliveryAnalyticsDTO getDeliveryAnalytics() {

    	log.info("Fetching delivery analytics");

        DeliveryAnalyticsDTO dto = new DeliveryAnalyticsDTO();

        dto.setDeliveryStats(deliveryRepo.getDeliveryStats());

        return dto;
    }

    //CUSTOMER ANALYTICS
    @Override
    public CustomerAnalyticsDTO getCustomerAnalytics() {

        CustomerAnalyticsDTO dto = new CustomerAnalyticsDTO();

        dto.setTopCustomers(orderRepo.getTopCustomers());

        return dto;
    }
    
    @Override
    public DeliveryPerformanceDTO getDeliveryPerformance() {
    	
    	log.info("Calculating delivery performance");
        DeliveryPerformanceDTO dto = new DeliveryPerformanceDTO();
        
        Double avg = deliveryRepo.getAverageDeliveryTime();
        dto.setAvgDeliveryTime(avg != null ? avg : 0.0);
        dto.setStatusStats(deliveryRepo.getDeliveryStats());

        return dto;
    }
    
    @Override
    public List<CustomerTrendDTO> getCustomerTrends() {
    	
    	log.info("Fetching customer trends");
        List<Object[]> data = orderRepo.getActiveUsersByDate();
        log.debug("Customer trend rows: {}", data.size());
        return data.stream().map(obj -> {
			if (obj[0] == null || obj[1] == null) {
			        return null; // skip bad rows
			    }
            CustomerTrendDTO dto = new CustomerTrendDTO();
            dto.setDate(obj[0].toString());
            dto.setActiveUsers((Long) obj[1]);
            return dto;
        }).filter(x -> x != null).toList();
    }
    
    @Override
    public List<HeatmapDTO> getOrderHeatmap() {
    	log.info("Fetching order heatmap");
        List<Object[]> data = orderRepo.getOrdersByCity();
        log.debug("Heatmap data size: {}", data.size());
        return data.stream().map(obj -> {
            HeatmapDTO dto = new HeatmapDTO();
            dto.setLocation((String) obj[0]);
            dto.setOrderCount((Long) obj[1]);
            return dto;
        }).toList();
    }

    //UPDATE PRODUCT
     @Override
     public ProductDTO updateProduct(Long productId, ProductDTO dto) {
    	 log.info("Updating product with id: {}", productId);
    	 
         Product product = productRepo.findById(productId)
                 .orElseThrow(() -> new RuntimeException("Product not found"));

         product.setName(dto.getName());
         product.setPrice(dto.getPrice());
         product.setSize(dto.getSize());

         product = productRepo.save(product);

         return mapProductToDTO(product);
     }

     //DELETE USER
     @Override
     public void deleteUser(Long userId) {

         if (!userRepo.existsById(userId)) {
             throw new RuntimeException("User not found");
         }

         userRepo.deleteById(userId);
     }

     //BLOCK USER
     @Override
     public String blockUser(Long userId) {

         User user = userRepo.findById(userId)
                 .orElseThrow(() -> new RuntimeException("User not found"));

          user.setBlocked(!user.isBlocked());

          userRepo.save(user);

          return user.isBlocked() ? "User blocked successfully" : "User unblocked successfully";
     }

     //UPDATE ORDER STATUS
     @Override
     public OrderDTO updateOrderStatus(Long orderId, String status) {

         Order order = orderRepo.findById(orderId)
                 .orElseThrow(() -> new RuntimeException("Order not found"));
         
         log.info("Updating order status for orderId: {}", orderId);

          if (!List.of("PENDING_PAYMENT","CONFIRMED","PREPARING","OUT_FOR_DELIVERY","DELIVERED","CANCELLED")
                  .contains(status)) {

             log.error("Invalid status received: {}", status); 
             throw new RuntimeException("Invalid status");
         }
         
         order.setStatus(status);

         order = orderRepo.save(order);

         return mapOrderToDTO(order);
     }

     //ASSIGN DELIVERY AGENT TO ORDER
     @Override
     public OrderDTO assignAgentToOrder(Long orderId, Long agentId) {

         Order order = orderRepo.findById(orderId)
                 .orElseThrow(() -> new RuntimeException("Order not found"));

         DeliveryAgent agent = agentRepo.findById(agentId)
                 .orElseThrow(() -> new RuntimeException("Delivery agent not found"));

         if (!agent.isAvailable()) {
             throw new RuntimeException("Delivery agent is not available");
         }

         if (deliveryRepo.findByOrderId(orderId).isPresent()) {
             throw new RuntimeException("Delivery already started for this order");
         }

         agent.setAvailable(false);
         agentRepo.save(agent);

         order.setStatus("OUT_FOR_DELIVERY");
         orderRepo.save(order);

         Delivery delivery = new Delivery();
         delivery.setOrder(order);
         delivery.setAgent(agent);
         delivery.setStatus("OUT_FOR_DELIVERY");
         delivery.setLatitude(SHOP_LAT);
         delivery.setLongitude(SHOP_LNG);
         deliveryRepo.save(delivery);

         return mapOrderToDTO(order);
     }

     @Override
     public List<DailyOrderDTO> getDailyOrderCounts() {
        List<Object[]> data = orderRepo.getDailyOrderCounts();
        return data.stream().map(obj -> {
            DailyOrderDTO dto = new DailyOrderDTO();
            dto.setDate(obj[0].toString());
            dto.setCount(obj[1] != null ? ((Number) obj[1]).longValue() : 0);
            return dto;
        }).toList();
    }

    @Override
    public List<OrderDTO> getAllOrders() {
         List<Order> orders = orderRepo.findAll();
         return orders.stream().map(order -> {
             OrderDTO dto = mapOrderToDTO(order);
             Delivery delivery = deliveryRepo.findByOrderId(order.getId()).orElse(null);
             if (delivery != null) {
                 dto.setDeliveryAgentName(delivery.getAgent() != null ? delivery.getAgent().getName() : null);
                 dto.setDeliveryStatus(delivery.getStatus());
             }
             return dto;
         }).toList();
     }

     private ProductDTO mapProductToDTO(Product p) {

         ProductDTO dto = new ProductDTO();

         dto.setId(p.getId());
         dto.setName(p.getName());
         dto.setPrice(p.getPrice());
         dto.setSize(p.getSize());
         dto.setCategoryName(p.getCategory().getName());

         return dto;
     }

     private OrderDTO mapOrderToDTO(Order o) {

         OrderDTO dto = new OrderDTO();

         dto.setId(o.getId());
         dto.setUserId(o.getUser().getId());
         dto.setUserName(o.getUser().getName());
         dto.setTotalAmount(o.getTotalAmount());
         dto.setTaxAmount(o.getTaxAmount());
         dto.setStatus(o.getStatus());
         dto.setCreatedAt(o.getCreatedAt());

         if (o.getDeliveryAddress() != null) {
             AddressDTO addr = new AddressDTO();
             addr.setId(o.getDeliveryAddress().getId());
             addr.setStreet(o.getDeliveryAddress().getStreet());
             addr.setCity(o.getDeliveryAddress().getCity());
             addr.setState(o.getDeliveryAddress().getState());
             addr.setPincode(o.getDeliveryAddress().getPincode());
             addr.setLandmark(o.getDeliveryAddress().getLandmark());
             addr.setLatitude(o.getDeliveryAddress().getLatitude());
             addr.setLongitude(o.getDeliveryAddress().getLongitude());
             dto.setDeliveryAddress(addr);
         }

         if (o.getItems() != null) {
             dto.setItems(o.getItems().stream().map(item -> {
                 OrderItemDTO itemDTO = new OrderItemDTO();
                 itemDTO.setProductId(item.getProduct().getId());
                 itemDTO.setProductName(item.getProduct().getName());
                 itemDTO.setQuantity(item.getQuantity());
                 itemDTO.setPrice(item.getPrice());
                 return itemDTO;
             }).collect(Collectors.toList()));
         }

         return dto;
     }
 }