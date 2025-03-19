package com.SWE.CinemaEBookingSystem.config;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.Null;
import org.springframework.stereotype.Component;

import javax.crypto.KeyGenerator;

@Component
public class AESUtil { 

    @Value("${custom.secret-key}")
    private String aesKey;
    private static final String ALGORITHM = "AES";

    @PostConstruct
    public void init() {
        if (aesKey == null) {
            throw new IllegalStateException("AES Key not set!");
        }
    }


    
    public void setAesKey(String key) {
        aesKey = key;
    }
    public   String encrypt(String data) {
        System.out.println("Encrypt method called with: " + data);
        if(data == null){
            System.out.println("NULL DATA ");

        }
        System.out.println("Secret Key in AESUtil: " + aesKey); 
      
        try{
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            byte[] decodedkey = Base64.getDecoder().decode(aesKey);
            SecretKeySpec keySpec = new SecretKeySpec(decodedkey,ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE,keySpec);
            return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes()));

        }
        catch(Exception e){
            throw new RuntimeException("Encryption error", e);
        }
    }
    public String decrypt(String encryptedData) {
        try {
            byte[] decodedKey = Base64.getDecoder().decode(aesKey);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(decodedKey, ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            return new String(cipher.doFinal(Base64.getDecoder().decode(encryptedData)));
        } catch (Exception e) {
            throw new RuntimeException("Decryption error", e);
        }
    }





}