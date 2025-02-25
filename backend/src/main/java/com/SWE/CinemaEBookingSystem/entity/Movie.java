package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;

@Entity
@Table(name = "movies")  // ✅ Ensures table name consistency
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;

    @ElementCollection
    @CollectionTable(name = "movie_cast", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "actor")
    private List<String> cast = new ArrayList<>();  // ✅ Initialize to avoid NullPointerException

    private String director;
    private String producer;
    private String synopsis;

    @ElementCollection
    @CollectionTable(name = "movie_reviews", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "review")
    private Set<String> reviews = new HashSet<>();  // ✅ Initialize to avoid NullPointerException

    private String link;

    @Enumerated(EnumType.STRING)
    private MovieRating rating;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Showdate> dates = new ArrayList<>();  // ✅ Properly initialize

    // ✅ Default constructor required by JPA
    public Movie() {}

    public Movie(String title, String category, List<String> cast, String director, String producer, String link, MovieRating rating, List<Showdate> dates) {
        this.title = title;
        this.category = category;
        this.cast = cast != null ? cast : new ArrayList<>();
        this.director = director;
        this.producer = producer;
        this.link = link;
        this.rating = rating;
        this.dates = dates != null ? dates : new ArrayList<>();
        this.reviews = new HashSet<>();
    }

    // ✅ Getters and Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public List<String> getCast() { return cast; }
    public String getDirector() { return director; }
    public String getProducer() { return producer; }
    public String getTrailerVideo() { return link; }
    public MovieRating getRating() { return rating; }
    public List<Showdate> getDates() { return dates; }
    public Set<String> getReviews() { return reviews; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setCategory(String category) { this.category = category; }
    public void setCast(List<String> cast) { this.cast = cast != null ? cast : new ArrayList<>(); }
    public void setDirector(String director) { this.director = director; }
    public void setProducer(String producer) { this.producer = producer; }
    public void setTrailerVideo(String link) { this.link = link; }
    public void setRating(MovieRating rating) { this.rating = rating; }
    public void setDates(List<Showdate> dates) { this.dates = dates != null ? dates : new ArrayList<>(); }
    public void setReviews(Set<String> reviews) { this.reviews = reviews != null ? reviews : new HashSet<>(); }
}
