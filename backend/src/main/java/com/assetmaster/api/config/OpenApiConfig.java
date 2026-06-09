package com.assetmaster.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI assetMasterOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AssetMaster API")
                        .version("v1")
                        .description("Digital assets marketplace REST API"));
    }
}
