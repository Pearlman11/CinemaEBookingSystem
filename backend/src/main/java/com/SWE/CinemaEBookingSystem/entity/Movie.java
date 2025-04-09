package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;

import java.time.Duration;

import java.util.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "movies") // Ensure table name is explicitly defined
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(nullable = false)
    private String category;

    @ElementCollection
    @CollectionTable(name = "movie_cast", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "cast_member")
    private List<String> cast;

    @Column(nullable = false)
    private String director;

    @Column(nullable = false)
    private String producer;

    @Column(nullable = false, length = 500) // URL may be long, so increased size
    private String trailer; // New field for YouTube trailer link

    @Column(nullable = false, length = 500)
    private String poster; // New field for poster image URL

    @Column(nullable = false, columnDefinition = "TEXT") // To allow long descriptions
    private String description; // New field for movie description

    @ElementCollection
    @CollectionTable(name = "movie_reviews", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "review")
    private Set<String> reviews; // New field for reviews

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovieRating rating;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Showtime> showTimes;

    @Column(nullable = false)
    private Long durationInMinutes;

    public Movie() {
        this.cast = new ArrayList<>();
        this.showTimes = new ArrayList<>();
        this.reviews = new HashSet<>();
    }

    public Movie(String title, String category, List<String> cast, String director, String producer,
                 String trailer, String poster, String description, Set<String> reviews, 
                 MovieRating rating, List<Showtime> showTimes,Duration duration) {
        this.title = title;
        this.category = category;
        this.cast = cast != null ? cast : new ArrayList<>();
        this.director = director;
        this.producer = producer;
        this.trailer = trailer;
        this.poster = poster;
        this.description = description;
        this.reviews = reviews != null ? reviews : new HashSet<>();
        this.rating = rating;
        this.showTimes = showTimes != null ? showTimes : new ArrayList<>();
        this.durationInMinutes = duration.toMinutes();
    }

    // ✅ Getters
public Long getId() { return id; }
public String getTitle() { return title; }
public String getCategory() { return category; }
public List<String> getCast() { return new ArrayList<>(cast); } // Returns a copy to prevent external modification
public String getDirector() { return director; }
public String getProducer() { return producer; }
public String getTrailer() { return trailer; }  // Fixed naming from 'link' to 'trailer'
public String getPoster() { return poster; }    // Added getter for poster image
public String getDescription() { return description; } // Added getter for movie description
public MovieRating getRating() { return rating; }
public List<Showtime> getshowTimes() { return new ArrayList<>(showTimes); } // Returns a copy for safety
public Set<String> getReviews() { return new HashSet<>(reviews); } // Returns a copy for safety
public Long getDuration(){return durationInMinutes;}

// ✅ Setters
public void setId(Long id) { this.id = id; }
public void setTitle(String title) { this.title = title; }
public void setCategory(String category) { this.category = category; }
public void setCast(List<String> cast) { this.cast = (cast != null) ? new ArrayList<>(cast) : new ArrayList<>(); }
public void setDirector(String director) { this.director = director; }
public void setProducer(String producer) { this.producer = producer; }
public void setTrailer(String trailer) { this.trailer = trailer; } // Fixed setter name
public void setPoster(String poster) { this.poster = poster; } // Added setter for poster image
public void setDescription(String description) { this.description = description; } // Added setter for description
public void setRating(MovieRating rating) { this.rating = rating; }
public void setshowTimes(List<Showtime> showTimes) { this.showTimes = (showTimes != null) ? new ArrayList<>(showTimes) : new ArrayList<>(); }
public void setReviews(Set<String> reviews) { this.reviews = (reviews != null) ? new HashSet<>(reviews) : new HashSet<>(); }
public void setDuration(Duration duration){this.durationInMinutes = duration.toMinutes();}

}
