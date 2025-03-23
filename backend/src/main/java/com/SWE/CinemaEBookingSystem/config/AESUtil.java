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
    private static final String aesKey = "JRkLqh6gw1ZbHZe30KZ/ncQ2LYGSe62tN7vsUloUpu4=";
    private static final String ALGORITHM = "AES";

    @PostConstruct
    public void init() {
        if (aesKey == null) {
            throw new IllegalStateException("AES Key not set!");
        }
    }


    
    
    public String encrypt(String data) {
        System.out.println("Encrypt method called with: " + data);
        if(data == null){
            System.out.println("NULL DATA ");

        }
        System.out.println("Secret Key in AESUtil: " + aesKey); 
      
        try{
            
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            byte[] decodedkey = Base64.getDecoder().decode(aesKey);
            SecretKeySpec keySpec = new SecretKeySpec(decodedkey,ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE,keySpec);
            byte[] encryptedData = cipher.doFinal(data.getBytes());
            System.out.println("Encrypted data length (in bytes): " + encryptedData.length);
            return Base64.getEncoder().encodeToString(encryptedData);

        }
        catch(Exception e){
            throw new RuntimeException("Encryption error", e);
        }
    }
    public String decrypt(String encryptedData) {
        try {
            byte[] decodedKey = Base64.getDecoder().decode(aesKey);
            
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            SecretKeySpec keySpec = new SecretKeySpec(decodedKey, ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decodedData = Base64.getDecoder().decode(encryptedData);
            System.out.println("Encrypted data length (in bytes): " + decodedData.length);
            return new String(cipher.doFinal(decodedData));
        } catch (Exception e) {
            throw new RuntimeException("Decryption error", e);
        }
    }





}