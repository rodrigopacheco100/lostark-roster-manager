import type { SVGProps } from "react"
import type { LostArkClass } from "@/db/schema"
import { Aeromancer } from "./Aeromancer"
import { Arcanist } from "./Arcanist"
import { Artillerist } from "./Artillerist"
import { Artist } from "./Artist"
import { Bard } from "./Bard"
import { Berserker } from "./Berserker"
import { Breaker } from "./Breaker"
import { Deadeye } from "./Deadeye"
import { Deathblade } from "./Deathblade"
import { Destroyer } from "./Destroyer"
import { Glaivier } from "./Glaivier"
import { GuardianKnight } from "./GuardianKnight"
import { Gunlancer } from "./Gunlancer"
import { Gunslinger } from "./Gunslinger"
import { Machinist } from "./Machinist"
import { Paladin } from "./Paladin"
import { Reaper } from "./Reaper"
import { Scrapper } from "./Scrapper"
import { Shadowhunter } from "./Shadowhunter"
import { Sharpshooter } from "./Sharpshooter"
import { Slayer } from "./Slayer"
import { Sorceress } from "./Sorceress"
import { Souleater } from "./Souleater"
import { Soulfist } from "./Soulfist"
import { Striker } from "./Striker"
import { Summoner } from "./Summoner"
import { Valkyrie } from "./Valkyrie"
import { Wardancer } from "./Wardancer"
import { Wildsoul } from "./Wildsoul"

export const mappedIconsByClass: Partial<Record<LostArkClass, React.FC<SVGProps<SVGSVGElement>>>> = {
  Berserker,
  Deathblade,
  Glaivier,
  Gunslinger,
  Gunlancer,
  Paladin,
  Shadowhunter,
  Souleater,
  Sorceress,
  Aeromancer,
  Striker,
  Wardancer,
  Arcanist,
  Artillerist,
  Bard,
  Reaper,
  Scrapper,
  Sharpshooter,
  Slayer,
  Soulfist,
  Summoner,
  Deadeye,
  Artist,
  Breaker,
  Destroyer,
  GuardianKnight,
  Machinist,
  Valkyrie,
  Wildsoul,
}
