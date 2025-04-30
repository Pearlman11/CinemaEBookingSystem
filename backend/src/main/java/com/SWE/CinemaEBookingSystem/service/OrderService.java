
package com.SWE.CinemaEBookingSystem.service;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.SWE.CinemaEBookingSystem.config.AESUtil;
import com.SWE.CinemaEBookingSystem.entity.Order;
import com.SWE.CinemaEBookingSystem.entity.PaymentCards;
import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.repository.OrderRepository;
import com.SWE.CinemaEBookingSystem.repository.PaymentCardRepository;
import com.SWE.CinemaEBookingSystem.repository.UserRepository;


@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public OrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }
    @Transactional
    public Order addOrderToUser(Integer userId,Order order ){
         User user = userRepository.findById(userId)
                 .orElseThrow(() -> new RuntimeException("User not found with id" + userId));
    
         order.setUser(user);
         return orderRepository.save(order);
        
    }


}
