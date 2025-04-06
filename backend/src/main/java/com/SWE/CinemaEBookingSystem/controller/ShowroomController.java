package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Showroom;
import com.SWE.CinemaEBookingSystem.repository.ShowroomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/showrooms")
public class ShowroomController {

    private final ShowroomRepository showroomRepository;

    @Autowired
    public ShowroomController(ShowroomRepository showroomRepository) {
        this.showroomRepository = showroomRepository;
    }

    @GetMapping
    public List<Showroom> getAllShowrooms() {
        return showroomRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Showroom> getShowroomById(@PathVariable Long id) {
        Optional<Showroom> showroom = showroomRepository.findById(id);
        return showroom.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}