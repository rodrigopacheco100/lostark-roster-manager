## ADDED Requirements

### Requirement: The system SHALL map ags.lol API class names to LostArkClass enum values
The system SHALL provide a function `mapAGSClassToLostArk(agsClassName: string): LostArkClass` that converts the snake_case class names from the ags.lol API to the internal PascalCase `LostArkClass` enum.

#### Scenario: Known class mapping succeeds
- **WHEN** `mapAGSClassToLostArk("yinyangshi")` is called
- **THEN** it returns `LostArkClass.Sorceress`

#### Scenario: Unknown class falls back to default
- **WHEN** `mapAGSClassToLostArk("unknown_class")` is called
- **THEN** it returns a fallback class (e.g., `LostArkClass.Striker`) without throwing

### Requirement: The mapping SHALL cover all known ags.lol API class names
The system SHALL include mappings for every class name that the ags.lol API may return, based on known Lost Ark class identifiers.

#### Scenario: All warrior classes mapped
- **WHEN** mapping "berserker", "destroyer", "gunlancer", "paladin", "slayer", "valkyrie", "berserker_female", "warlord"
- **THEN** they map to their respective `LostArkClass` enum values

#### Scenario: All mage classes mapped
- **WHEN** mapping "arcanist", "summoner", "bard", "sorceress", "yinyangshi"
- **THEN** they map to their respective `LostArkClass` enum values

#### Scenario: All martial artist classes mapped
- **WHEN** mapping "wardancer", "scrapper", "soulfist", "glaivier", "striker", "breaker", "battle_master_male", "infighter_male"
- **THEN** they map to their respective `LostArkClass` enum values

#### Scenario: All assassin classes mapped
- **WHEN** mapping "deathblade", "shadowhunter", "reaper", "souleater", "blade", "demonic"
- **THEN** they map to their respective `LostArkClass` enum values

#### Scenario: All gunner classes mapped
- **WHEN** mapping "sharpshooter", "deadeye", "artillerist", "machinist", "gunslinger", "devil_hunter_female"
- **THEN** they map to their respective `LostArkClass` enum values

#### Scenario: All specialist classes mapped
- **WHEN** mapping "artist", "aeromancer", "wildsoul", "weather_artist", "elemental_master"
- **THEN** they map to their respective `LostArkClass` enum values

#### Scenario: Guardian knight class mapped
- **WHEN** mapping "holyknight", "holyknight_female"
- **THEN** they map to `LostArkClass.GuardianKnight`
