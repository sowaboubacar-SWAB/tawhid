package com.swab.tawhid.services;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;
import java.util.UUID;

@Service
public class R2PresignService {

    // ⚠️ REMPLACE PAR TES VRAIES CLÉS
    private final String accessKey = "3e2e68871069251492ccf0fca63e611f";
    private final String secretKey = "7b034e1772dbf0b4fece9133465d42ce91a5eee72c760bf7fd055efcc749681e";

    private final String endpoint = "https://TON_ACCOUNT_ID.r2.cloudflarestorage.com";
    private final String bucketName = "tawhid-audio";

    public String generateUploadUrl(String originalFilename) {
        // 1. Générer un nom unique pour le fichier sur Cloudflare
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;

        // 2. Configurer le client S3 pour R2
        S3Configuration serviceConfiguration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false)
                .build();

        try (S3Presigner presigner = S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.of("auto"))
                .serviceConfiguration(serviceConfiguration)
                .build()) {

            // 3. Créer la demande d'upload
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(newFilename)
                    .contentType("audio/mpeg") // On force le type pour éviter les abus
                    .build();

            // 4. Générer l'URL valide pendant 5 minutes
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(5))
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);

            // On retourne l'URL ET le nom du fichier pour le stocker en base
            // Pour faire simple, on va retourner une chaîne "URL|NOM_FICHIER"
            return presignedRequest.url().toString() + "|" + newFilename;
        }
    }
}