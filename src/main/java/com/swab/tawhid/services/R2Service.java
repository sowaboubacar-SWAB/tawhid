package com.swab.tawhid.services;

import software.amazon.awssdk.services.s3.S3Configuration;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Service
public class R2Service {

    // ⚠️ REMPLACE CES VALEURS PAR TES VRAIES CLÉS CLOUDFLARE
    private final String accessKey = "8fc29765d16b8313554a700e243efeed";
    private final String secretKey = "599764933517f3eab11985a5c00b5b450f7ed3e6631b0b984e1c76cfe3c36116";
    private final String endpoint = "https://TON_ID_COMPTE.r2.cloudflarestorage.com";
    private final String bucketName = "tawhid-audio";

    private S3Client getClient() {
        // Configuration spécifique pour R2 : désactiver le chunked encoding
        S3Configuration serviceConfiguration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false) // <-- C'est la ligne cruciale
                .build();

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.of("auto"))
                .serviceConfiguration(serviceConfiguration) // <-- On ajoute la config
                .build();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(newFilename)
                .contentType(file.getContentType())
                .build();

        getClient().putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        return newFilename;
    }
}