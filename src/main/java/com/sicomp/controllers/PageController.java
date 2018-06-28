package com.sicomp.controllers;

import com.sicomp.util.JabberQueueUtil;

import java.io.IOException;
import java.io.Serializable;
import java.util.concurrent.TimeoutException;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
 
@ManagedBean(name="pageController")
@SessionScoped
public class PageController implements Serializable{

    public String processPage1 = "success";

    private static final long serialVersionUID = 1L;

    public String getProcessPage1() {
        return processPage1;
    }

    public void setProcessPage1(String processPage1) {
        this.processPage1 = processPage1;
    }

    public String initConnection() throws IOException, TimeoutException {

        System.out.println("initConnection");

        JabberQueueUtil.init();

        JabberQueueUtil.createChannelListener("testuser");

        JabberQueueUtil.createChannelListener("ahernandez");

        return "success";
    }

    public String processPage1() throws IOException, TimeoutException {

        System.out.println("processPage1");

        return "success";
    }
	
}