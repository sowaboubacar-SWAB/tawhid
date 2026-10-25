package com.swab.tawhid.exceptions;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Hidden
@ControllerAdvice
public class GlobalExceptionHandler {

    // Intercepte toutes les RuntimeException (comme celles qu'on a lancées dans nos services)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.NOT_FOUND.value());
        // On renvoie une réponse 404 propre avec un JSON lisible
        return new ResponseEntity<>(body,HttpStatus.NOT_FOUND);
    }
    // Intercepte les erreurs de validation (@Valid)
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status",HttpStatus.BAD_REQUEST.value());

        //On recup tous les msg d'erreurs
        Map<String,String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach((error)->
                errors.put(error.getField(),error.getDefaultMessage())
        );
        body.put("errors",errors);

        return new ResponseEntity<>(body,HttpStatus.BAD_REQUEST);
    }

}
