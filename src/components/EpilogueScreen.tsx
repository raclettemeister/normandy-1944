import { useState, useEffect } from "react";
import type { GameState, PlaythroughEvent } from "../types/index.ts";
import { NarrativeService } from "../services/narrativeService.ts";
import { getRelationshipsForSoldier } from "../content/relationships.ts";

interface EpilogueScreenProps {
  finalState: GameState;
  captainSurvived: boolean;
  onRestart: () => void;
  narrativeService: NarrativeService;
  eventLog: PlaythroughEvent[];
}

function generateDefaultEpilogue(
  name: string,
  status: string,
  hometown: string
): string {
  switch (status) {
    case "active":
      return `${name} a survecu a la guerre. Il est retourne a ${hometown} et a mene une vie discrete. Il parlait rarement de la Normandie.`;
    case "wounded":
      return `${name} a ete evacue vers un hopital de campagne en Angleterre. Apres des mois de convalescence, il a ete renvoye a ${hometown}. Il a garde une claudication toute sa vie.`;
    case "KIA":
      return `${name} est mort au combat pres de Sainte-Marie-du-Mont le 6 juin 1944. Il repose au cimetiere americain de Normandie a Colleville-sur-Mer. Sa famille a ${hometown} a recu sa Purple Heart a titre posthume.`;
    case "missing":
      return `${name} a ete capture par les forces allemandes le 6 juin. Il a passe des mois en captivite avant sa liberation en 1945. Il est revenu a ${hometown} et n'a jamais parle du camp.`;
    default:
      return `${name} a servi avec distinction.`;
  }
}

export default function EpilogueScreen({
  finalState,
  captainSurvived,
  onRestart,
  narrativeService,
  eventLog,
}: EpilogueScreenProps) {
  const survived = finalState.roster.filter(
    (s) => s.status === "active"
  ).length;
  const total = finalState.roster.length;

  const [epilogues, setEpilogues] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(narrativeService.getMode() === "llm");

  useEffect(() => {
    if (narrativeService.getMode() !== "llm") return;

    const eventsBySoldier = new Map<string, PlaythroughEvent[]>();
    const relationshipsBySoldier = new Map();

    for (const soldier of finalState.roster) {
      eventsBySoldier.set(
        soldier.id,
        eventLog.filter(e => e.soldierIds.includes(soldier.id))
      );
      relationshipsBySoldier.set(
        soldier.id,
        getRelationshipsForSoldier(soldier.id)
      );
    }

    narrativeService.generateEpilogues(
      finalState.roster,
      eventsBySoldier,
      relationshipsBySoldier,
    ).then(results => {
      setEpilogues(results);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [narrativeService, finalState.roster, eventLog]);

  function getEpilogue(soldierId: string, name: string, status: string, hometown: string): string {
    return epilogues.get(soldierId) ?? generateDefaultEpilogue(name, status, hometown);
  }

  return (
    <div className="epilogue-screen" data-testid="epilogue-screen">
      <h2 className="epilogue-screen__title">Apres-guerre</h2>

      {captainSurvived ? (
        <div className="epilogue-soldier">
          <div className="epilogue-soldier__name">Le capitaine</div>
          <div className="epilogue-soldier__text">
            Il a mene le 2e peloton pendant 24 heures de combat en Normandie.{" "}
            {survived} de ses {total} hommes ont survecu a la journee. Il a
            ensuite combattu a Carentan, Market Garden et dans les Ardennes. Il
            a porte les noms des hommes perdus jusqu'a la fin de sa vie.
          </div>
        </div>
      ) : (
        <div className="epilogue-soldier">
          <div className="epilogue-soldier__name">Le capitaine</div>
          <div className="epilogue-soldier__text">
            Il est mort au combat pres de Sainte-Marie-du-Mont le 6 juin 1944.
            {finalState.secondInCommand && (
              <>
                {" "}Le commandement est passe a {finalState.secondInCommand.soldier.rank}{" "}
                {finalState.secondInCommand.soldier.name}.
              </>
            )}{" "}
            {survived} de {total} hommes ont survecu a la journee.
          </div>
        </div>
      )}

      {loading && (
        <div className="epilogue-loading" data-testid="epilogue-loading">
          Generation des epilogues...
        </div>
      )}

      {finalState.roster.map((soldier) => (
        <div
          key={soldier.id}
          className="epilogue-soldier"
          data-testid={`epilogue-soldier-${soldier.id}`}
        >
          <div className="epilogue-soldier__name">
            {soldier.rank} {soldier.name}
            {soldier.nickname ? ` "${soldier.nickname}"` : ""}
          </div>
          <div className="epilogue-soldier__text">
            {getEpilogue(soldier.id, soldier.name, soldier.status, soldier.hometown)}
          </div>
        </div>
      ))}

      <div className="epilogue-screen__footer">
        <p className="epilogue-memorial">
          A la memoire des hommes qui ont combattu et sont morts en Normandie, le 6 juin 1944.
        </p>
        <div data-testid="run-statistics" style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Scenes visitees : {finalState.scenesVisited.length} · Lecons
            retenues : {finalState.wikiUnlocked.length} · Hommes restants :{" "}
            {finalState.men}
          </p>
        </div>
        <button
          className="btn btn--primary"
          data-testid="restart-btn"
          onClick={onRestart}
        >
          Recommencer la campagne
        </button>
      </div>
    </div>
  );
}
