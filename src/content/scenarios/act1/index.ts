import { registerScenarios } from "../../../engine/scenarioLoader.ts";
import { scene01_landing } from "./scene01_landing.ts";
import { scene02_finding_north } from "./scene02_finding_north.ts";
import { scene03_first_contact } from "./scene03_first_contact.ts";
import { scene04_the_straggler } from "./scene04_the_straggler.ts";
import { scene05_the_sergeant } from "./scene05_the_sergeant.ts";
import { scene05_the_patrol } from "./scene05_the_patrol.ts";
import { scene06_the_farmhouse } from "./scene06_the_farmhouse.ts";
import { scene08_the_crossroad } from "./scene08_the_crossroad.ts";
import { scene09_the_minefield } from "./scene09_the_minefield.ts";
import { scene10_rally_point } from "./scene10_rally_point.ts";

registerScenarios([
  scene01_landing,
  scene02_finding_north,
  scene03_first_contact,
  scene04_the_straggler,
  scene05_the_sergeant,
  scene05_the_patrol,
  scene06_the_farmhouse,
  scene08_the_crossroad,
  scene09_the_minefield,
  scene10_rally_point,
]);
