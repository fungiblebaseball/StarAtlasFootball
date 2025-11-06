use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use log::{info, error};

mod star_atlas;
mod models;

use models::{PlayerProfile, CrewMember, ApiResponse};

#[derive(Deserialize)]
struct ProfileQuery {
    wallet_address: String,
}

#[derive(Deserialize)]
struct CrewQuery {
    player_profile_pubkey: String,
}

// Health check endpoint
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "star-atlas-blockchain-service",
        "version": "0.1.0"
    }))
}

// Get player profiles for a wallet address
async fn get_player_profiles(query: web::Query<ProfileQuery>) -> impl Responder {
    info!("Fetching player profiles for wallet: {}", query.wallet_address);
    
    match star_atlas::fetch_player_profiles(&query.wallet_address).await {
        Ok(profiles) => {
            info!("Successfully fetched {} profiles", profiles.len());
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                data: Some(profiles),
                error: None,
            })
        }
        Err(e) => {
            error!("Failed to fetch player profiles: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<Vec<PlayerProfile>> {
                success: false,
                data: None,
                error: Some(e.to_string()),
            })
        }
    }
}

// Get crew list for a specific player profile
async fn get_crew_list(query: web::Query<CrewQuery>) -> impl Responder {
    info!("Fetching crew list for profile: {}", query.player_profile_pubkey);
    
    match star_atlas::fetch_crew_list(&query.player_profile_pubkey).await {
        Ok(crew) => {
            info!("Successfully fetched {} crew members", crew.len());
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                data: Some(crew),
                error: None,
            })
        }
        Err(e) => {
            error!("Failed to fetch crew list: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<Vec<CrewMember>> {
                success: false,
                data: None,
                error: Some(e.to_string()),
            })
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    info!("Starting Star Atlas Blockchain Service on port 3001");
    
    HttpServer::new(|| {
        // Configure CORS to allow requests from the TypeScript server
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
        
        App::new()
            .wrap(cors)
            .route("/health", web::get().to(health))
            .route("/api/player-profiles", web::get().to(get_player_profiles))
            .route("/api/crew", web::get().to(get_crew_list))
    })
    .bind(("0.0.0.0", 3001))?
    .run()
    .await
}
