package com.secondhand.shop.admin.service;

import com.secondhand.shop.admin.dto.CustomerDTO;
import java.util.List;

public interface CustomerService {

    List<CustomerDTO> getAllCustomers();

    CustomerDTO getCustomerById(Long id);

    CustomerDTO getCustomerByUserId(Long userId);

    CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO);

    void deleteCustomer(Long id);

    CustomerDTO createCustomerWithUser(Long userId, CustomerDTO customerDTO);

}