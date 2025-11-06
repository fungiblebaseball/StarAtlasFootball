use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerProfile {
    pub pubkey: String,
    pub name: Option<String>,
    pub faction: Option<String>,
    pub crew_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrewMember {
    pub das_id: String,
    pub mint_offset: Option<u32>,
    pub name: String,
    pub image_url: Option<String>,
    pub faction: Option<String>,
    pub species: Option<String>,
    pub sex: Option<String>,
    pub university: Option<String>,
    pub age: Option<f32>,
    
    // Big Five Personality Traits
    pub openness: f32,
    pub conscientiousness: f32,
    pub extraversion: f32,
    pub agreeableness: f32,
    pub neuroticism: f32,
    
    pub rarity: String,
    pub aptitudes: Option<HashMap<String, String>>,
}
