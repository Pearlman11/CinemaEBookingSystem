package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String title;
    private String category;

    @ElementCollection
    @CollectionTable(name = "movie_cast", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "actor")
    private List<String> cast;

    
    private String director;
    private String producer;
    private String synopsis;
    private Set<String> reviews;

    @OneToMany(mappedBy = "movie")
    private List<Showdate> dates = new ArrayList<Showdate>();









    private String link;

    @Enumerated(EnumType.STRING)
    private MovieRating rating;

    

     
    public Movie() {}

    public Movie(String title,String category,List<String> cast,String director,String producer,String link, MovieRating rating,List<Showdate> dates){
        this.title = title;
        this.category = category;
        this.cast = cast;
        this.director = director;
        this.producer = producer;
        this.link = link;
        this.rating = rating;
        this.dates = dates;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public List<String> getCast() { return cast; }
    public String getDirector() { return director; }
    public String getProducer() { return producer; }
    public String getTrailerVideo() { return link; }
    public MovieRating getRating() { return rating; }
    public List<Showdate> getShowdate() { return dates;}
   
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setCategory(String category) { this.category = category; }
    public void setCast(List<String> cast) { this.cast = cast; }
    public void setDirector(String director) { this.director = director; }
    public void setProducer(String producer) { this.producer = producer; }
    public void setTrailerVideo(String link) { this.link = link; }
    public void setRating(MovieRating rating) { this.rating = rating; }
    public void setShowdate(List<Showdate> dates){this.dates = dates;}
   























    

    
}
