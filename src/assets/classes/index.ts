import type { SVGProps } from "react"
import type { LostArkClass } from "@/db/schema"
import { Berserker } from "./Berserker"
import { Deathblade } from "./Deathblade"
// import { Glaivier } from "./Glaivier";
// import { Gunslinger } from "./Gunslinger";
// import { Gunlancer } from "./Gunlancer";
import { Paladin } from "./Paladin"
// import { Sorceress } from "./Sorceress";
// import { Aeromancer } from "./Aeromancer";
// import { Striker } from "./Striker";
// import { Wardancer } from "./Wardancer";
// import { Arcanist } from "./Arcanist";
// import { Artillerist } from "./Artillerist";
// import { Bard } from "./Bard";
import { Reaper } from "./Reaper"
import { Shadowhunter } from "./Shadowhunter"
import { Souleater } from "./Souleater"
// import { Scrapper } from "./Scrapper";
// import { Sharpshooter } from "./Sharpshooter";
// import { Slayer } from "./Slayer";
// import { Soulfist } from "./Soulfist";
// import { Summoner } from "./Summoner";
// import { Deadeye } from "./Deadeye";
// import { Artist } from "./Artist";
// import { Breaker } from "./Breaker";
// import { Destroyer } from "./Destroyer";
// import { GuardianKnight } from "./GuardianKnight";
// import { Machinist } from "./Machinist";
// import { Valkyrie } from "./Valkyrie";
// import { Wildsoul } from "./Wildsoul";

export const mappedIconsByClass: Partial<Record<LostArkClass, React.FC<SVGProps<SVGSVGElement>>>> = {
  Berserker,
  Deathblade,
  // Glaivier,
  // Gunslinger,
  // Gunlancer,
  Paladin,
  Shadowhunter,
  Souleater,
  // Sorceress,
  // Aeromancer,
  // Striker,
  // Wardancer,
  // Arcanist,
  // Artillerist,
  // Bard,
  Reaper,
  // Scrapper,
  // Sharpshooter,
  // Slayer,
  // Soulfist,
  // Summoner,
  // Deadeye,
  // Artist,
  // Breaker,
  // Destroyer,
  // GuardianKnight,
  // Machinist,
  // Valkyrie,
  // Wildsoul,
}
