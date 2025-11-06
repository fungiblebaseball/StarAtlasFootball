use anyhow::{Result, Context};
use log::{info, warn};
use crate::models::{PlayerProfile, CrewMember};

/// Fetch player profiles associated with a wallet address
/// This uses star-frame to query the Solana blockchain
pub async fn fetch_player_profiles(wallet_address: &str) -> Result<Vec<PlayerProfile>> {
    info!("Querying blockchain for wallet: {}", wallet_address);
    
    // TODO: Implement actual star-frame integration
    // For now, return a mock profile for development
    warn!("Using mock data - star-frame integration not yet implemented");
    
    Ok(vec![
        PlayerProfile {
            pubkey: "B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m".to_string(),
            name: Some("Default Profile".to_string()),
            faction: Some("ONI".to_string()),
            crew_count: 100,
        }
    ])
}

/// Fetch crew list for a specific player profile
/// This uses star-frame to query the Solana blockchain
pub async fn fetch_crew_list(player_profile_pubkey: &str) -> Result<Vec<CrewMember>> {
    info!("Querying blockchain for player profile: {}", player_profile_pubkey);
    
    // TODO: Implement actual star-frame integration
    // For now, fallback to the Star Atlas REST API
    warn!("Using REST API fallback - star-frame integration not yet implemented");
    
    fetch_crew_from_api(player_profile_pubkey).await
}

/// Fallback: Fetch crew from Star Atlas REST API
async fn fetch_crew_from_api(profile_id: &str) -> Result<Vec<CrewMember>> {
    let url = format!("https://galaxy.staratlas.com/crew/inventory/{}", profile_id);
    info!("Fetching crew from API: {}", url);
    
    let response = reqwest::get(&url)
        .await
        .context("Failed to fetch from Star Atlas API")?;
    
    if !response.status().is_success() {
        anyhow::bail!("API returned error status: {}", response.status());
    }
    
    let data: serde_json::Value = response.json()
        .await
        .context("Failed to parse API response")?;
    
    let crew_array = data["crew"]
        .as_array()
        .context("Missing 'crew' field in API response")?;
    
    let mut crew_members = Vec::new();
    
    for crew_item in crew_array {
        let member = CrewMember {
            das_id: crew_item["_id"].as_str().unwrap_or("").to_string(),
            mint_offset: crew_item["mintOffset"].as_u64().map(|v| v as u32),
            name: crew_item["name"].as_str().unwrap_or("Unknown").to_string(),
            image_url: crew_item["imageUrl"].as_str().map(|s| s.to_string()),
            faction: crew_item["faction"].as_str().map(|s| s.to_string()),
            species: crew_item["species"].as_str().map(|s| s.to_string()),
            sex: crew_item["sex"].as_str().map(|s| s.to_string()),
            university: crew_item["university"].as_str().map(|s| s.to_string()),
            age: crew_item["age"].as_f64().map(|v| v as f32),
            
            openness: crew_item["openness"].as_f64().unwrap_or(0.5) as f32,
            conscientiousness: crew_item["conscientiousness"].as_f64().unwrap_or(0.5) as f32,
            extraversion: crew_item["extraversion"].as_f64().unwrap_or(0.5) as f32,
            agreeableness: crew_item["agreeableness"].as_f64().unwrap_or(0.5) as f32,
            neuroticism: crew_item["neuroticism"].as_f64().unwrap_or(0.5) as f32,
            
            rarity: crew_item["rarity"].as_str().unwrap_or("Common").to_string(),
            aptitudes: crew_item["aptitudes"].as_object().map(|obj| {
                obj.iter()
                    .map(|(k, v)| (k.clone(), v.as_str().unwrap_or("").to_string()))
                    .collect()
            }),
        };
        
        crew_members.push(member);
    }
    
    info!("Successfully parsed {} crew members", crew_members.len());
    Ok(crew_members)
}
