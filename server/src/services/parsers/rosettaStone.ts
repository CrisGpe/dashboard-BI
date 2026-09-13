import { AgentMaster } from "../../types.js";
import { cleanAgentName, parseSafeNumber, parseExcelTime } from "./dataParsers.js";

export interface AgentRegistry {
  agents: AgentMaster[];
  agentNameMap: Map<string, string>;
  agentByCanonical: Map<string, AgentMaster>;
  resolveAgentName: (rawName: string) => string;
}

export function buildAgentRegistry(
  agentesRaw: any[][] = [],
  agentesLuxuryRaw: any[][] = [],
  agentesGlossRaw: any[][] = []
): AgentRegistry {
  const agents: AgentMaster[] = [];
  const agentNameMap = new Map<string, string>();
  const agentByCanonical = new Map<string, AgentMaster>();

  // 1. Process Salón RD Agents
  agentesRaw.forEach((row, idx) => {
    const nombre = cleanAgentName(String(row[2] || ""));
    if (!nombre || nombre === "Colaboradores" || nombre === "Sin asignar") return;

    const agent: AgentMaster = {
      ficha: parseSafeNumber(row[1]) || idx + 1,
      nombre,
      relacionLaboral: String(row[3] || "Dependiente").trim(),
      salon: String(row[4] || "RD").trim(),
      hrEntrada: parseExcelTime(row[5]) || "-",
      hrSalida: parseExcelTime(row[6]) || "-",
      diaDescanso: String(row[7] || "-").trim(),
      estado: String(row[10] || "Activo").trim(),
      especialidad: String(row[11] || "Estilismo").trim(),
      dni: row[9] ? String(row[9]).trim() : undefined,
      celular: row[14] ? String(row[14]).trim() : undefined,
      genero: row[15] ? String(row[15]).trim() : undefined
    };

    agents.push(agent);
    agentNameMap.set(nombre.toLowerCase(), nombre);
    agentByCanonical.set(nombre, agent);

    const nickname = String(row[13] || "").trim();
    if (nickname) {
      agentNameMap.set(nickname.toLowerCase(), nombre);
    }
  });

  // 2. Process Luxury RD Agents (Official Luxury Staff & Shift Schedules)
  agentesLuxuryRaw.forEach((row, idx) => {
    const nombre = cleanAgentName(String(row[2] || ""));
    if (!nombre || nombre === "Colaboradores" || nombre === "Sin asignar") return;

    const agent: AgentMaster = {
      ficha: parseSafeNumber(row[1]) || (idx + 1000),
      nombre,
      relacionLaboral: String(row[3] || "Agente dependiente").trim(),
      salon: "Luxury RD",
      hrEntrada: parseExcelTime(row[5]) || "10:30 am",
      hrSalida: parseExcelTime(row[6]) || "8:00 pm",
      diaDescanso: String(row[7] || "-").trim(),
      estado: String(row[10] || "Activo").trim(),
      especialidad: String(row[11] || "Estilismo").trim(),
      dni: row[9] ? String(row[9]).trim() : undefined,
      celular: row[14] ? String(row[14]).trim() : undefined,
      genero: row[15] ? String(row[15]).trim() : undefined
    };

    agents.push(agent);
    agentNameMap.set(nombre.toLowerCase(), nombre);
    agentByCanonical.set(nombre, agent);

    const nickname = String(row[13] || "").trim();
    if (nickname) {
      agentNameMap.set(nickname.toLowerCase(), nombre);
    }
    const firstName = nombre.split(" ")[0].toLowerCase();
    if (!agentNameMap.has(firstName)) {
      agentNameMap.set(firstName, nombre);
    }
  });

  // 3. Process Gloss Salon Agents (Official Gloss Staff & Shift Schedules)
  agentesGlossRaw.forEach((row, idx) => {
    const nombre = cleanAgentName(String(row[2] || ""));
    if (!nombre || nombre === "Colaboradores" || nombre === "Sin asignar") return;

    const agent: AgentMaster = {
      ficha: parseSafeNumber(row[1]) || (idx + 2000),
      nombre,
      relacionLaboral: String(row[3] || "Agente dependiente").trim(),
      salon: "Gloss Salon",
      hrEntrada: parseExcelTime(row[5]) || "10:00 am",
      hrSalida: parseExcelTime(row[6]) || "8:00 pm",
      diaDescanso: String(row[7] || "-").trim(),
      estado: String(row[10] || "Activo").trim(),
      especialidad: String(row[11] || "Estilismo").trim(),
      dni: row[9] ? String(row[9]).trim() : undefined,
      celular: row[14] ? String(row[14]).trim() : undefined,
      genero: row[15] ? String(row[15]).trim() : undefined
    };

    agents.push(agent);
    agentNameMap.set(nombre.toLowerCase(), nombre);
    agentByCanonical.set(nombre, agent);

    const nickname = String(row[13] || "").trim();
    if (nickname) {
      agentNameMap.set(nickname.toLowerCase(), nombre);
    }
    const firstName = nombre.split(" ")[0].toLowerCase();
    if (!agentNameMap.has(firstName)) {
      agentNameMap.set(firstName, nombre);
    }
  });

  // Custom Rosetta Stone mapping between Luxury sales names and legal collaborator names
  agentNameMap.set("gladys glosss", "Gladis Laiza Bazan");
  agentNameMap.set("gladis", "Gladis Laiza Bazan");
  agentNameMap.set("gladis laiza bazan", "Gladis Laiza Bazan");
  agentNameMap.set("magaly laiza bazan", "Magali Laiza Bazan");
  agentNameMap.set("magali", "Magali Laiza Bazan");
  agentNameMap.set("magali laiza bazan", "Magali Laiza Bazan");
  agentNameMap.set("rosa linda garcia hidalgo", "Rosalinda Garcia Hdalgo");
  agentNameMap.set("rosalinda garcia hdalgo", "Rosalinda Garcia Hdalgo");
  agentNameMap.set("rosalinda garcia hidalgo", "Rosalinda Garcia Hdalgo");
  agentNameMap.set("rosa", "Rosalinda Garcia Hdalgo");
  agentNameMap.set("maribel villanueva carvajal", "Maribel Villanueva Carbajal");
  agentNameMap.set("maribel villanueva carbajal", "Maribel Villanueva Carbajal");
  agentNameMap.set("maribel", "Maribel Villanueva Carbajal");
  agentNameMap.set("edith marisol villanueva carvajal", "Edith Marisol Villanueva Carbajal");
  agentNameMap.set("edith marisol villanueva carbajal", "Edith Marisol Villanueva Carbajal");
  agentNameMap.set("marisol", "Edith Marisol Villanueva Carbajal");
  agentNameMap.set("jimmy carlos flores coca", "Carlos Jimi Flores Coca");
  agentNameMap.set("carlos jimi flores coca", "Carlos Jimi Flores Coca");
  agentNameMap.set("carlos", "Carlos Jimi Flores Coca");
  agentNameMap.set("jimi", "Carlos Jimi Flores Coca");
  agentNameMap.set("jimmy", "Carlos Jimi Flores Coca");
  agentNameMap.set("maykol daza", "Maykol Daza Donato");
  agentNameMap.set("maykol daza donato", "Maykol Daza Donato");
  agentNameMap.set("maykol", "Maykol Daza Donato");
  agentNameMap.set("marcela patricia villanueva zamora", "Marcela Villanueva Zamora");
  agentNameMap.set("marcela villanueva zamora", "Marcela Villanueva Zamora");
  agentNameMap.set("marcela", "Marcela Villanueva Zamora");
  agentNameMap.set("jahaira kimberly reyes castro", "Jahaira Reyes Castro");
  agentNameMap.set("jahaira reyes castro", "Jahaira Reyes Castro");
  agentNameMap.set("jahayra reyes castro", "Jahaira Reyes Castro");
  agentNameMap.set("jahaira", "Jahaira Reyes Castro");
  agentNameMap.set("belen", "Belen Jimenez Troncos");
  agentNameMap.set("belen jimenez troncos", "Belen Jimenez Troncos");
  agentNameMap.set("yadira vasquez perez", "Yadira Vasquez Perez");
  agentNameMap.set("yadira", "Yadira Vasquez Perez");
  agentNameMap.set("luz roman", "Luz Roman Velasquez");
  agentNameMap.set("luz roman velasquez", "Luz Roman Velasquez");
  agentNameMap.set("luz", "Luz Roman Velasquez");
  agentNameMap.set("exley", "EXLEY YUSMEYRIN SANCHEZ PEREZ");
  agentNameMap.set("exley yusmeyrin sanchez perez", "EXLEY YUSMEYRIN SANCHEZ PEREZ");
  agentNameMap.set("danna caballero", "DANNA NATASHA CABALLERO CEOPA");
  agentNameMap.set("danna natasha caballero ceopa", "DANNA NATASHA CABALLERO CEOPA");
  agentNameMap.set("danna", "DANNA NATASHA CABALLERO CEOPA");
  agentNameMap.set("pamela cotrina", "PAMELA COTRINA");
  agentNameMap.set("pamela", "PAMELA COTRINA");
  agentNameMap.set("papucho", "JORGE CHILCA GONZALES");
  agentNameMap.set("jorge chilca gonzales", "JORGE CHILCA GONZALES");
  agentNameMap.set("augusto carlos", "CARLOS COFIURE");
  agentNameMap.set("carlos cofiure", "CARLOS COFIURE");

  // Custom Gloss Salon Rosetta Stone mapping
  agentNameMap.set("mar", "DELIA MARTHA YAHUANA PULACHE");
  agentNameMap.set("delia", "DELIA MARTHA YAHUANA PULACHE");
  agentNameMap.set("delia martha yahuana pulache", "DELIA MARTHA YAHUANA PULACHE");
  agentNameMap.set("lala", "Eualalia Chipana Buitron");
  agentNameMap.set("eulalia", "Eualalia Chipana Buitron");
  agentNameMap.set("eualalia chipana buitron", "Eualalia Chipana Buitron");

  const resolveAgentName = (rawName: string): string => {
    if (!rawName) return "Sin asignar";
    const cleaned = cleanAgentName(rawName);
    const matched = agentNameMap.get(cleaned.toLowerCase());
    if (matched) return matched;

    // Fuzzy first name match
    const firstName = cleaned.split(" ")[0].toLowerCase();
    const firstMatched = agentNameMap.get(firstName);
    if (firstMatched) return firstMatched;

    return cleaned;
  };

  return {
    agents,
    agentNameMap,
    agentByCanonical,
    resolveAgentName
  };
}
