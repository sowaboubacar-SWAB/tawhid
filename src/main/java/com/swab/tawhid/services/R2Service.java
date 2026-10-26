package com.swab.tawhid.services;

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
    private final String accessKey = "TON_ACCESS_KEY_ID";
    private final String secretKey = "TON_SECRET_ACCESS_KEY";
    private final String endpoint = "https://TON_ID_COMPTE.r2.cloudflarestorage.com";
    private final String bucketName = "tawhid-audio";

    private S3Client getClient() {
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.of("auto")) // R2 utilise "auto"
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