package com.Sms.service;

import com.Sms.Dto.*;

import com.Sms.Entity.*;

import java.util.*;

public interface UserService {
    User registerUser(SignupRequest signupRequest);
    User findUserByUsername(String username);
    List<User> findAllUsers();
}
