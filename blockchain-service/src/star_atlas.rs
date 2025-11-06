use anyhow::{Result, Context};
use log::{info, warn, error, debug};
use crate::models::{PlayerProfile, CrewMember};
use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

const PLAYER_PROFILE_PROGRAM_ID: &str = "pprofELXjL5Kck7Jn5hCpwAL82DpTkSYBENzahVtbc9";
const SOLANA_RPC_URL: &str = "https://api.mainnet-beta.solana.com";

/// Derive the PlayerName PDA for a given player profile
fn derive_player_name_pda(profile_pubkey: &Pubkey) -> Result<(Pubkey, u8)> {
    let program_id = Pubkey::from_str(PLAYER_PROFILE_PROGRAM_ID)
        .context("Invalid player profile program ID")?;
    
    let seeds = &[
        b"player_name",
        profile_pubkey.as_ref()
    ];
    
    Ok(Pubkey::find_program_address(seeds, &program_id))
}

/// Get player profile name from blockchain (synchronous)
/// Returns the name if found, otherwise returns "Unnamed Profile"
fn get_player_profile_name_sync(
    rpc_client: &RpcClient,
    profile_pubkey: &Pubkey
) -> Result<String> {
    
    // Derive the PlayerName PDA
    let (player_name_pda, _bump) = derive_player_name_pda(profile_pubkey)?;
    debug!("PlayerName PDA for {}: {}", profile_pubkey, player_name_pda);
    
    // Try to fetch the account
    match rpc_client.get_account_data(&player_name_pda) {
        Ok(account_data) => {
            // PlayerName account structure:
            // - 8 bytes: discriminator (Anchor)
            // - 1 byte: version
            // - 32 bytes: profile pubkey
            // - 1 byte: bump
            // - Remaining bytes: name (UTF-8 string)
            
            let name_offset = 42; // 8 + 1 + 32 + 1
            
            if account_data.len() <= name_offset {
                warn!("PlayerName account data too short for profile {}", profile_pubkey);
                return Ok("Unnamed Profile".to_string());
            }
            
            let name_bytes = &account_data[name_offset..];
            
            // Convert bytes to string, removing null terminators
            let name = String::from_utf8_lossy(name_bytes)
                .trim_end_matches('\0')
                .trim()
                .to_string();
            
            if name.is_empty() {
                info!("PlayerName account exists but name is empty for profile {}", profile_pubkey);
                Ok("Unnamed Profile".to_string())
            } else {
                info!("Found profile name: {} for {}", name, profile_pubkey);
                Ok(name)
            }
        },
        Err(e) => {
            // PlayerName account doesn't exist or RPC error
            debug!("PlayerName account not found for {}: {}", profile_pubkey, e);
            Ok("Unnamed Profile".to_string())
        }
    }
}

/// Get player profile name from blockchain (async wrapper)
async fn get_player_profile_name(
    profile_pubkey: Pubkey
) -> Result<String> {
    // Run blocking RPC call in a separate thread
    tokio::task::spawn_blocking(move || {
        let rpc_client = RpcClient::new(SOLANA_RPC_URL.to_string());
        get_player_profile_name_sync(&rpc_client, &profile_pubkey)
    })
    .await
    .context("Task join error")?
}

/// Fetch player profiles associated with a wallet address
/// This uses RPC to fetch profile names from blockchain
pub async fn fetch_player_profiles(wallet_address: &str) -> Result<Vec<PlayerProfile>> {
    info!("Querying blockchain for wallet: {}", wallet_address);
    
    // TODO: Implement full star-frame integration to discover profiles from wallet
    // For now, we'll use known profile pubkeys and fetch their real names
    warn!("Star-frame integration not yet implemented - using known profiles approach");
    
    // Known profile pubkeys to fetch names for
    // In production, these would be discovered from the wallet using star-frame
    let known_profile_pubkeys = vec![
        "B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m", // Default profile
    ];
    
    let mut profiles = Vec::new();
    
    for pubkey_str in known_profile_pubkeys {
        match Pubkey::from_str(pubkey_str) {
            Ok(profile_pubkey) => {
                // Fetch the real name from blockchain
                let name = get_player_profile_name(profile_pubkey)
                    .await
                    .unwrap_or_else(|e| {
                        error!("Error fetching name for profile {}: {}", pubkey_str, e);
                        "Unnamed Profile".to_string()
                    });
                
                profiles.push(PlayerProfile {
                    pubkey: pubkey_str.to_string(),
                    name: Some(name),
                    faction: None, // Would be fetched from profile account in full implementation
                    crew_count: 0, // Would be fetched from crew inventory in full implementation
                });
            },
            Err(e) => {
                error!("Invalid pubkey {}: {}", pubkey_str, e);
            }
        }
    }
    
    if profiles.is_empty() {
        // Fallback to ensure we always return at least one profile for development
        warn!("No profiles found, returning default mock profile");
        profiles.push(PlayerProfile {
            pubkey: "B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m".to_string(),
            name: Some("Default Profile".to_string()),
            faction: Some("ONI".to_string()),
            crew_count: 100,
        });
    }
    
    Ok(profiles)
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
