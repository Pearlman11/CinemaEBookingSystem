package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Order_Item;
import com.SWE.CinemaEBookingSystem.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemsController {

    private final OrderItemRepository orderItemRepository;

    @Autowired
    public OrderItemsController(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    // Get all order items
    @GetMapping
    public List<Order_Item> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    // Get an order item by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order_Item> getOrderItemById(@PathVariable Long id) {
        Optional<Order_Item> orderItem = orderItemRepository.findById(id);
        return orderItem.map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add a new order item
    @PostMapping
    public ResponseEntity<Order_Item> addOrderItem(@RequestBody Order_Item orderItem) {
        Order_Item savedOrderItem = orderItemRepository.save(orderItem);
        return ResponseEntity.ok(savedOrderItem);
    }

    // Update an existing order item
    @PutMapping("/{id}")
    public ResponseEntity<Order_Item> updateOrderItem(@PathVariable Long id, @RequestBody Order_Item orderItemDetails) {
        Optional<Order_Item> optionalOrderItem = orderItemRepository.findById(id);

        if (optionalOrderItem.isPresent()) {
            Order_Item orderItem = optionalOrderItem.get();
            orderItem.setOrder(orderItemDetails.getOrder());
            orderItem.setTicket(orderItemDetails.getTicket());
            orderItem.setQuantity(orderItemDetails.getQuantity());

            Order_Item updatedOrderItem = orderItemRepository.save(orderItem);
            return ResponseEntity.ok(updatedOrderItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete an order item
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrderItem(@PathVariable Long id) {
        if (orderItemRepository.existsById(id)) {
            orderItemRepository.deleteById(id);
            return ResponseEntity.ok("Order item deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
