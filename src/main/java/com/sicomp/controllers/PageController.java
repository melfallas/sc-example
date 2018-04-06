package com.sicomp.controllers;

import java.io.Serializable;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
 
@ManagedBean(name="pageController")
@SessionScoped
public class PageController implements Serializable{

    private static final long serialVersionUID = 1L;

    public String getProcessPage1() {
        return processPage1;
    }

    public void setProcessPage1(String processPage1) {
        this.processPage1 = processPage1;
    }

    public String processPage1 = "success";

    public String processPage1(){
        return "success";
    }
	
}