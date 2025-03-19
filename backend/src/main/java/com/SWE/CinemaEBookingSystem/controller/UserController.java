package com.SWE.CinemaEBookingSystem.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Optional;
import java.util.Map;

import com.SWE.CinemaEBookingSystem.entity.User;

import com.SWE.CinemaEBookingSystem.entity.UserRole;
import com.SWE.CinemaEBookingSystem.config.AESUtil;
import com.SWE.CinemaEBookingSystem.entity.PaymentCards;
import com.SWE.CinemaEBookingSystem.repository.UserRepository;
import com.SWE.CinemaEBookingSystem.repository.PaymentCardRepository;
import com.SWE.CinemaEBookingSystem.service.PaymentCardService;
import com.SWE.CinemaEBookingSystem.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private PaymentCardService paymentCardService;

    @Autowired
    private UserService userService;




    // Getting all users
    @GetMapping
    public ResponseEntity <List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    //Get Users by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Creating a new User
    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        System.out.println("UserId:"+user.getId());
        try {
            // Check if user already exists
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                Map<String, String> response = Map.of("message", "User with this email already exists");
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }

            // Encode password before saving
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            

            
            if (user.getPaymentCards() != null && !user.getPaymentCards().isEmpty() && user.getPaymentCards().get(0) != null) {
                PaymentCards card = paymentCardService.addPaymentCardToUser(user.getId(), user.getPaymentCards().get(0));
                System.out.println("UserId:"+user.getId()+user.getPaymentCards().get(0));
            }
            // Set default role if not provided
            if (user.getRole() == null) {
                user.setRole(UserRole.USER);
            }

            User savedUser = userRepository.save(user);
            

            
            
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch(Exception e) {
            Map<String, String> response = Map.of("message", "Error creating user: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }


    // Updating an existing user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();
            user.setFirstName(userDetails.getFirstName());
            user.setLastName(userDetails.getLastName());
            user.setEmail(userDetails.getEmail());
            user.setPassword(userDetails.getPassword());
            user.setPhone(userDetails.getPhone());
            user.setRole(userDetails.getRole());
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    //update on EditProfile //Need to finish payment card entity to full implement //Assumed that the request body has the updated card
    @PutMapping("/{id}/editprofile")
    public ResponseEntity<User> editProfileUpdate(@PathVariable Integer id, @RequestBody User userDetails) {
        Optional<User> userData = userRepository.findById(id);
        
        if (userData.isPresent()) {
            User user = userData.get();
            user.setFirstName(userDetails.getFirstName());
            user.setLastName(userDetails.getLastName());
            user.setPassword(userDetails.getPassword());
            List<PaymentCards> updatedCards = userDetails.getPaymentCards();
            for(PaymentCards card:updatedCards){
                paymentCardService.updateExistingCard(user.getId(), card); 
                
            }
            System.out.println(userDetails.getPaymentCards());

            User savedUser = userRepository.save(user);
            return new ResponseEntity<>(savedUser, HttpStatus.OK);
            
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @PostMapping("/{id}/payment-cards")
    public ResponseEntity<PaymentCards> addPaymentCardToUser(@PathVariable("id") Integer userId,@RequestBody PaymentCards card){
        System.out.println("User ID: " + userId);
        System.out.println("Received Card: " + card);
        if (card == null) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
        try{
            PaymentCards savedcard = paymentCardService.addPaymentCardToUser(userId, card);
            return  new ResponseEntity<>(savedcard, HttpStatus.CREATED);

            
        }catch(IllegalArgumentException ex){
            ex.printStackTrace();
           return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

    }

    







    //Delete a user
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Integer id) {
        try {
            userRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e ) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Find user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(value -> new ResponseEntity<>(value,HttpStatus.OK))
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    @GetMapping("/{userId}/payment-cards")
    public ResponseEntity<List<PaymentCards>> getUserPaymentCards(@PathVariable Integer userId) {
        User user = userService.findById(userId);
        List<PaymentCards> paymentCards = user.getPaymentCards();
        if (paymentCards == null) {
            paymentCards = new ArrayList<>();
        }
        AESUtil aesUtil = new AESUtil();  // Assuming AESUtil is your decryption utility
        for (PaymentCards card : paymentCards) {
            if (card.getCardNumber() != null) {
                try {
                String decryptedCardNumber = aesUtil.decrypt(card.getCardNumber());
                card.setCardNumber(decryptedCardNumber);
            } catch (Exception e) {
                throw new RuntimeException("Error decrypting card number", e);
            }
        }
    }

        return ResponseEntity.ok(paymentCards);
    }
}
