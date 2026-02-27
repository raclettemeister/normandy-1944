import { registerScenarios } from "../../../engine/scenarioLoader.ts";
import { scene01_approach } from "./scene01_approach.ts";
import { scene02_recon } from "./scene02_recon.ts";
import { scene03_base_of_fire } from "./scene03_base_of_fire.ts";
import { scene04_breach } from "./scene04_breach.ts";
import { scene05_assault } from "./scene05_assault.ts";
import { scene06_north_house } from "./scene06_north_house.ts";
import { scene07_south_barn } from "./scene07_south_barn.ts";
import { scene08_secure } from "./scene08_secure.ts";
import { scene09_consolidate } from "./scene09_consolidate.ts";
import { scene10_hold } from "./scene10_hold.ts";

registerScenarios([
  scene01_approach,
  scene02_recon,
  scene03_base_of_fire,
  scene04_breach,
  scene05_assault,
  scene06_north_house,
  scene07_south_barn,
  scene08_secure,
  scene09_consolidate,
  scene10_hold,
]);
