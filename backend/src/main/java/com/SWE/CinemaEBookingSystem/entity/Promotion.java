package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*; 
import javax.validation.constraints.AssertTrue;  
import java.time.LocalDate;


@Entity
@Table(name = "promotions")
public class Promotion {
    @Id
    @Column(name = "promotion_code", length = 50, nullable = false)
    private String promotionCode;

    
    @Temporal(TemporalType.DATE)
    @Column(name = "start_date",nullable = false)
    private LocalDate startDate;

    @Column(name = "discount_percentage", nullable = false)
    private double discountPercentage;

    @Temporal(TemporalType.DATE)
    @Column(name = "end_date",nullable=false)
    private LocalDate endDate;

    @AssertTrue(message = "Start date must be before or equal to end date")
    public boolean isStartDateBeforeOrEqualToEndDate() {
        return startDate == null || endDate == null || !startDate.isAfter(endDate); // ✅ fixed
    }




    public Promotion(){};
    public Promotion(String promotionCode, LocalDate startDate, LocalDate endDate){
       this.promotionCode = promotionCode;
       this.startDate = startDate;
       this.endDate = endDate;

    }

   
    public String getPromotionCode() {return promotionCode;}
    public void setPromotionCode(String promotionCode) {this.promotionCode = promotionCode;}
    public LocalDate getStartDate() {return startDate;}
    public void setStartDate(LocalDate startDate) {this.startDate = startDate;}
    public LocalDate getEndDate() {return endDate;}
    public void setEndDate(LocalDate endDate) {this.endDate = endDate;}
    public void setDiscountPercentage(double discountPercentage) {this.discountPercentage = discountPercentage;}
    public double getDiscountPercentage() {return discountPercentage;}

}
