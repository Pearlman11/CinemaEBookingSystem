package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*;


@Entity
public class PriceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AgeCategory type;



    private Double price;
     
    public PriceCategory() {}

    public PriceCategory(AgeCategory type, Double price){
        this.type = type;
        this.price = price;
    }


    public Long getId(){return id;}
    public void setId(Long id){this.id = id;}
    public AgeCategory getType(){ return type;}
    public void setType(AgeCategory type){this.type = type;}
    public Double getPrice(){return price;}
    public void setPrice(Double price){this.price = price;}

    









}