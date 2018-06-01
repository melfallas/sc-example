package com.sicomp.util;

import com.rabbitmq.client.*;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class JabberQueueUtil {

    private final static String QUEUE_NAME = "spring-boot-queue";
    private final static String EXCHANGE_TYPE = "topic";
    private final static String HOST = "172.31.251.11";
    private final static int PORT = 5672;
    private final static String USER_NAME = "test";
    private final static String PASSWORD = "test";
    private static Connection connection = null;

    public static void init() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(HOST);
        factory.setPort(PORT);
        factory.setUsername(USER_NAME);
        factory.setPassword(PASSWORD);
        connection = factory.newConnection();
    }

    public static void createChannelListener(String username) throws IOException {
        Channel channel = connection.createChannel();
        channel.exchangeDeclare(username, EXCHANGE_TYPE);

        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        channel.queueBind(QUEUE_NAME, username, username);

        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body)
                    throws IOException {
                String message = new String(body, "UTF-8");
                System.out.println(" [x] Received '" + message + "'");
            }
        };
        channel.basicConsume(QUEUE_NAME, true, consumer);
    }

}
