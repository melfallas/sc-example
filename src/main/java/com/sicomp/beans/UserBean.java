package com.sicomp.beans;

import java.io.IOException;
import java.io.Serializable;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import com.rabbitmq.client.*;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Base64;

import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.concurrent.TimeoutException;

@ManagedBean(name="user")
@SessionScoped
public class UserBean implements Serializable{

    private String firstName = "Andres";
    private String lastName = "Hernandez";
    private String username = "testuser";
    private String encryptedUsername = "";

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUsername() { return username; }

    public String getEncryptedUsername() {
        String base64EncodedEncryptedData = "";
        try{

            String keyValue = "Abcdefghijklmnop";
            SecretKeyFactory factory =   SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
            KeySpec spec = new PBEKeySpec(keyValue.toCharArray(), hex("dc0da04af8fee58593442bf834b30739"),1000, 128);

            Key key = new SecretKeySpec(factory.generateSecret(spec).getEncoded(), "AES");
            Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
            c.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(hex("dc0da04af8fee58593442bf834b30739")));

            byte[] encVal = c.doFinal(username.getBytes());
            base64EncodedEncryptedData = new String(Base64.encodeBase64(encVal));
//            System.out.println(base64EncodedEncryptedData);

        }catch(NoSuchAlgorithmException nsae){
            nsae.printStackTrace();
        } catch (BadPaddingException e) {
            e.printStackTrace();
        } catch (IllegalBlockSizeException e) {
            e.printStackTrace();
        } catch (NoSuchPaddingException e) {
            e.printStackTrace();
        } catch (InvalidKeySpecException e) {
            e.printStackTrace();
        } catch (InvalidAlgorithmParameterException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        }

        return base64EncodedEncryptedData;
    }

    public void setEncryptedUsername(String encryptedUsername) {
        this.encryptedUsername = encryptedUsername;
    }

    public static byte[] hex(String str) {
        try {
            return Hex.decodeHex(str.toCharArray());
        }
        catch (DecoderException e) {
            throw new IllegalStateException(e);
        }
    }

    public String login() {

        System.out.println(this.getUsername());

        return "success";
    }


	
}