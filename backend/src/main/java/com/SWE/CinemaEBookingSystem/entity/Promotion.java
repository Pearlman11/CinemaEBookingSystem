package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*; 
import javax.validation.constraints.AssertTrue;  
import java.util.Date;


@Entity
@Table(name = "promotions")
public class Promotion {
    @Id
    @Column(name = "promotion_code", length = 50, nullable = false)
    private String promotionCode;

    
    @Temporal(TemporalType.DATE)
    @Column(name = "start_date",nullable = false)
    private Date startDate;

    
    @Temporal(TemporalType.DATE)
    @Column(name = "end_date",nullable=false)
    private Date endDate;

    @AssertTrue(message = "Start date must be before or equal to end date")
    public boolean isStartDateBeforeOrEqualToEndDate(){
        return startDate == null || endDate == null || !startDate.after(endDate);
    }



    public Promotion(){};
    public Promotion(String promotionCode,Date startDate,Date endDate){
       this.promotionCode = promotionCode;
       this.startDate = startDate;
       this.endDate = endDate;

    }

   
    public String getPromotionCode() {return promotionCode;}
    public void setPromotionCode(String promotionCode) {this.promotionCode = promotionCode;}
    public Date getStartDate() {return startDate;}
    public void setStartDate(Date startDate) {this.startDate = startDate;}
    public Date getEndDate() {return endDate;}
    public void setEndDate(Date endDate) {this.endDate = endDate;}

}
