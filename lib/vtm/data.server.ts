// ── CMD VTM tower mill power model — server-side data ────────────────────────
// Generated from the CMD installation benchmark workbook
// (tower_mill_power_model_results.xlsx, 82 installations, Aug 2026).
//
// PROPRIETARY. This module holds the calibrated model coefficients and the
// full installation benchmark database. It must only ever be imported from
// server code (API route handlers) — never from a client component — so that
// none of it reaches the browser bundle. See docs/vtm-tower-model.md.

export interface ModelCoefficients {
  k: number
  aD: number
  aH: number
  aS: number
  aN: number
  maxErrPct: number
  meanErrPct: number
}

export type MillFamily = 'VTM' | 'JETM'

export interface Frame {
  model: string
  type: MillFamily
  D: number // mill body diameter, m
  H: number // mill body height, m
  S: number // screw pitch, m
  rpm: number // screw speed, rpm
  ratedKW: number // installed motor power per unit, kW
}

export interface Installation {
  type: MillFamily
  site: string
  location: string | null
  model: string
  units: number
  material: string | null
  application: string
  p80: number
  tph: number
  D: number
  H: number
  S: number
  rpm: number
  ratedKW: number
  shaftKW: number
  pNitta: number
  pMJ: number
  pRadz: number
  pAvg: number
  diffPct: number
}

export interface BenchmarkStats {
  n: number
  meanDiffPct: number
  sdDiffPct: number
  p10DiffPct: number
  p90DiffPct: number
}

/** Motor shaft power as a fraction of installed (rated) motor power. */
export const SHAFT_FRACTION = 0.884

export const COEFFICIENTS: Record<MillFamily, { nitta: ModelCoefficients; mj: ModelCoefficients; radz: ModelCoefficients }> = {
  "VTM": {
    "nitta": {
      "k": 0.046778424726196366,
      "aD": 2.0976874630090934,
      "aH": 0.40195183740087465,
      "aS": 2.0802382640092514,
      "aN": 1.8683848604766033,
      "maxErrPct": 5.22,
      "meanErrPct": 1.43
    },
    "mj": {
      "k": 1.7528509303838875,
      "aD": 1.9407383668377691,
      "aH": 0.943311189235115,
      "aS": 0.640761565325402,
      "aN": 0.5797635662732733,
      "maxErrPct": 0.29,
      "meanErrPct": 0.14
    },
    "radz": {
      "k": 0.018459578745974675,
      "aD": 2.0990916012247074,
      "aH": 0.49613485442825006,
      "aS": 1.8501704612423546,
      "aN": 2.122099650040842,
      "maxErrPct": 5.28,
      "meanErrPct": 1.4
    }
  },
  "JETM": {
    "nitta": {
      "k": 0.27340244407002934,
      "aD": 1.2569591370396047,
      "aH": 1.0737701506169472,
      "aS": 1.81811061005281,
      "aN": 1.2479305809826031,
      "maxErrPct": 0.32,
      "meanErrPct": 0.13
    },
    "mj": {
      "k": 1.6939565067123552,
      "aD": 2.2666297560752415,
      "aH": 0.7513323969064362,
      "aS": 0.5305524894393937,
      "aN": 0.6285320686456733,
      "maxErrPct": 0.55,
      "meanErrPct": 0.18
    },
    "radz": {
      "k": 0.1307204563697486,
      "aD": 1.4847881599196984,
      "aH": 1.0092568976170742,
      "aS": 1.4966054903806287,
      "aN": 1.4864760261361345,
      "maxErrPct": 0.07,
      "meanErrPct": 0.02
    }
  }
}

export const FRAMES: Frame[] = [
  { model: "JETM100", type: "JETM", D: 0.6, H: 3, S: 0.21, rpm: 75, ratedKW: 75.0 },
  { model: "JETM700", type: "JETM", D: 1.8, H: 6.5, S: 0.63, rpm: 42, ratedKW: 520.0 },
  { model: "JETM1000", type: "JETM", D: 2.2, H: 7.5, S: 0.77, rpm: 38, ratedKW: 745.0 },
  { model: "JETM1200", type: "JETM", D: 2.5, H: 8.5, S: 0.88, rpm: 35, ratedKW: 895.0 },
  { model: "JETM1450", type: "JETM", D: 2.8, H: 9.5, S: 0.98, rpm: 32, ratedKW: 1080.0 },
  { model: "JETM1500", type: "JETM", D: 3, H: 10, S: 1.05, rpm: 30, ratedKW: 1118.0 },
  { model: "JETM1500LS", type: "JETM", D: 3, H: 10, S: 1.05, rpm: 30, ratedKW: 1118.0 },
  { model: "JETM2000", type: "JETM", D: 3.5, H: 11.5, S: 1.23, rpm: 27, ratedKW: 1490.0 },
  { model: "VTM-125", type: "VTM", D: 1.3, H: 3.5, S: 0.8, rpm: 36, ratedKW: 93.0 },
  { model: "VTM-150", type: "VTM", D: 1.43, H: 3.97, S: 0.88, rpm: 35, ratedKW: 112.0 },
  { model: "VTM-200", type: "VTM", D: 1.69, H: 3.72, S: 0.9, rpm: 33, ratedKW: 149.0 },
  { model: "VTM-250", type: "VTM", D: 1.82, H: 3.88, S: 0.95, rpm: 32, ratedKW: 186.0 },
  { model: "VTM-300", type: "VTM", D: 1.95, H: 4.06, S: 1.03, rpm: 30, ratedKW: 224.0 },
  { model: "VTM-400", type: "VTM", D: 2.34, H: 4.21, S: 1.02, rpm: 28, ratedKW: 298.0 },
  { model: "VTM-500", type: "VTM", D: 2.86, H: 4.26, S: 1, rpm: 26, ratedKW: 372.0 },
  { model: "VTM-650", type: "VTM", D: 2.86, H: 4.85, S: 1.13, rpm: 25, ratedKW: 484.0 },
  { model: "VTM-800", type: "VTM", D: 3.25, H: 4.96, S: 1.15, rpm: 24, ratedKW: 596.0 },
  { model: "VTM-1000", type: "VTM", D: 3.51, H: 5.33, S: 1.26, rpm: 22, ratedKW: 745.0 },
  { model: "VTM-1250", type: "VTM", D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 931.3 },
  { model: "VTM-1500", type: "VTM", D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 1117.5 },
  { model: "VTM-2000", type: "VTM", D: 4.81, H: 6.49, S: 1.55, rpm: 17, ratedKW: 1490.0 },
  { model: "VTM-3000", type: "VTM", D: 5.85, H: 7.36, S: 1.7, rpm: 15, ratedKW: 2235.0 },
  { model: "VTM-4500", type: "VTM", D: 6.5, H: 8.18, S: 1.95, rpm: 14, ratedKW: 3352.7 },
]

export const BENCHMARK_STATS: Record<MillFamily, BenchmarkStats> = {
  "VTM": {
    "n": 64,
    "meanDiffPct": -6.7,
    "sdDiffPct": 11.4,
    "p10DiffPct": -26.1,
    "p90DiffPct": 2.7
  },
  "JETM": {
    "n": 18,
    "meanDiffPct": -19.9,
    "sdDiffPct": 27.7,
    "p10DiffPct": -40.9,
    "p90DiffPct": 5.9
  }
}

export const INSTALLATIONS: Installation[] = [
  { type: "VTM", site: "Escondida", location: null, model: "VTM-1250", units: 6, material: null, application: "Regrind", p80: 37, tph: 134.3, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 5588, shaftKW: 4939, pNitta: 4950, pMJ: 5152, pRadz: 4579, pAvg: 4894, diffPct: -0.9 },
  { type: "VTM", site: "North American Pd 1500", location: null, model: "VTM-1500", units: 4, material: null, application: "Regrind", p80: 100, tph: 372, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 4470, shaftKW: 3951, pNitta: 3981, pMJ: 3952, pRadz: 3601, pAvg: 3844, diffPct: -2.7 },
  { type: "VTM", site: "Williams Operating", location: null, model: "VTM-1500", units: 3, material: null, application: "Regrind", p80: 30, tph: 110, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 3352, shaftKW: 2963, pNitta: 2985, pMJ: 2964, pRadz: 2701, pAvg: 2883, diffPct: -2.7 },
  { type: "VTM", site: "Escondida 1500", location: null, model: "VTM-1500", units: 2, material: null, application: "Regrind", p80: 44, tph: 308, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 2235, shaftKW: 1976, pNitta: 1990, pMJ: 1976, pRadz: 1800, pAvg: 1922, diffPct: -2.7 },
  { type: "VTM", site: "Newmont Indonesia", location: null, model: "VTM-1250", units: 2, material: null, application: "Regrind", p80: 25, tph: 163, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 1862, shaftKW: 1645, pNitta: 1650, pMJ: 1717, pRadz: 1526, pAvg: 1631, diffPct: -0.8 },
  { type: "VTM", site: "Collahuasi Zn", location: null, model: "VTM-1250", units: 2, material: null, application: "Regrind", p80: 25, tph: 161, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 1862, shaftKW: 1645, pNitta: 1650, pMJ: 1717, pRadz: 1526, pAvg: 1631, diffPct: -0.8 },
  { type: "VTM", site: "Antamina CuConc", location: null, model: "VTM-1250", units: 2, material: null, application: "Regrind", p80: 37, tph: 134.3, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 1862, shaftKW: 1645, pNitta: 1650, pMJ: 1717, pRadz: 1526, pAvg: 1631, diffPct: -0.8 },
  { type: "VTM", site: "Cerro Verde", location: null, model: "VTM-1250", units: 2, material: null, application: "Regrind", p80: 44, tph: 100, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 1862, shaftKW: 1645, pNitta: 1650, pMJ: 1717, pRadz: 1526, pAvg: 1631, diffPct: -0.8 },
  { type: "VTM", site: "Minera Alumbrera", location: null, model: "VTM-1250", units: 2, material: null, application: "Regrind", p80: 57, tph: 283, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 1862, shaftKW: 1645, pNitta: 1650, pMJ: 1717, pRadz: 1526, pAvg: 1631, diffPct: -0.8 },
  { type: "VTM", site: "Barrick Nevada", location: null, model: "VTM-1250", units: 2, material: null, application: "Regrind", p80: 25, tph: 96, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 1862, shaftKW: 1645, pNitta: 1650, pMJ: 1717, pRadz: 1526, pAvg: 1631, diffPct: -0.8 },
  { type: "VTM", site: "Los Pelambres Pb", location: null, model: "VTM-1250", units: 2, material: null, application: "Regrind", p80: 25, tph: 130, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 1862, shaftKW: 1645, pNitta: 1650, pMJ: 1717, pRadz: 1526, pAvg: 1631, diffPct: -0.8 },
  { type: "VTM", site: "El Teniente", location: null, model: "VTM-1500", units: 1, material: null, application: "Regrind", p80: 45, tph: 700, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 1118, shaftKW: 988, pNitta: 995, pMJ: 988, pRadz: 900, pAvg: 961, diffPct: -2.7 },
  { type: "VTM", site: "FMC Idaho", location: null, model: "VTM-1250", units: 1, material: null, application: "Regrind", p80: 45, tph: 256, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 931, shaftKW: 822, pNitta: 825, pMJ: 859, pRadz: 763, pAvg: 816, diffPct: -0.8 },
  { type: "VTM", site: "Jacksonville Electric", location: null, model: "VTM-1250", units: 5, material: null, application: "Regrind", p80: 45, tph: 256, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 4656, shaftKW: 4112, pNitta: 4125, pMJ: 4294, pRadz: 3816, pAvg: 4078, diffPct: -0.8 },
  { type: "VTM", site: "Israel Electric", location: null, model: "VTM-1500", units: 2, material: null, application: "Regrind", p80: 45, tph: 142, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 2235, shaftKW: 1976, pNitta: 1990, pMJ: 1976, pRadz: 1800, pAvg: 1922, diffPct: -2.7 },
  { type: "VTM", site: "Worsley Alumina", location: null, model: "VTM-1500", units: 2, material: null, application: "Regrind", p80: 45, tph: 202, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 2235, shaftKW: 1976, pNitta: 1990, pMJ: 1976, pRadz: 1800, pAvg: 1922, diffPct: -2.7 },
  { type: "VTM", site: "McArthur River", location: null, model: "VTM-1000", units: 2, material: null, application: "Regrind", p80: 45, tph: 143, D: 3.51, H: 5.33, S: 1.26, rpm: 22, ratedKW: 1490, shaftKW: 1316, pNitta: 1333, pMJ: 1355, pRadz: 1281, pAvg: 1323, diffPct: 0.5 },
  { type: "VTM", site: "Antamina Cu", location: null, model: "VTM-1250", units: 1, material: null, application: "Regrind", p80: 45, tph: 155, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 931, shaftKW: 822, pNitta: 825, pMJ: 859, pRadz: 763, pAvg: 816, diffPct: -0.8 },
  { type: "VTM", site: "Antamina CuAu", location: null, model: "VTM-1000", units: 1, material: null, application: "Regrind", p80: 45, tph: 110, D: 3.51, H: 5.33, S: 1.26, rpm: 22, ratedKW: 745, shaftKW: 658, pNitta: 667, pMJ: 677, pRadz: 641, pAvg: 661, diffPct: 0.5 },
  { type: "VTM", site: "BHP Cannington 1000", location: null, model: "VTM-1000", units: 2, material: null, application: "Regrind", p80: 44, tph: 518.91, D: 3.51, H: 5.33, S: 1.26, rpm: 22, ratedKW: 1490, shaftKW: 1316, pNitta: 1333, pMJ: 1355, pRadz: 1281, pAvg: 1323, diffPct: 0.5 },
  { type: "VTM", site: "Freeport 1000", location: null, model: "VTM-1000", units: 2, material: null, application: "Regrind", p80: 45, tph: 83, D: 3.51, H: 5.33, S: 1.26, rpm: 22, ratedKW: 1490, shaftKW: 1316, pNitta: 1333, pMJ: 1355, pRadz: 1281, pAvg: 1323, diffPct: 0.5 },
  { type: "VTM", site: "Midas Gold", location: null, model: "VTM-1000", units: 1, material: null, application: "Regrind", p80: 35, tph: 90, D: 3.51, H: 5.33, S: 1.26, rpm: 22, ratedKW: 745, shaftKW: 658, pNitta: 667, pMJ: 677, pRadz: 641, pAvg: 661, diffPct: 0.5 },
  { type: "VTM", site: "Antamina 1000", location: null, model: "VTM-1000", units: 1, material: null, application: "Regrind", p80: 45, tph: 110, D: 3.51, H: 5.33, S: 1.26, rpm: 22, ratedKW: 745, shaftKW: 658, pNitta: 667, pMJ: 677, pRadz: 641, pAvg: 661, diffPct: 0.5 },
  { type: "VTM", site: "San Cristobal LS", location: null, model: "VTM-400", units: 2, material: null, application: "Regrind", p80: 45, tph: 15.51, D: 2.34, H: 4.21, S: 1.02, rpm: 28, ratedKW: 596, shaftKW: 527, pNitta: 533, pMJ: 495, pRadz: 559, pAvg: 529, diffPct: 0.4 },
  { type: "VTM", site: "WMC Mt Keith", location: null, model: "VTM-800", units: 1, material: null, application: "Regrind", p80: 50, tph: 165.11, D: 3.25, H: 4.96, S: 1.15, rpm: 24, ratedKW: 596, shaftKW: 527, pNitta: 530, pMJ: 541, pRadz: 528, pAvg: 533, diffPct: 1.2 },
  { type: "VTM", site: "Lepanto", location: null, model: "VTM-800", units: 1, material: null, application: "Regrind", p80: 50, tph: 355, D: 3.25, H: 4.96, S: 1.15, rpm: 24, ratedKW: 596, shaftKW: 527, pNitta: 530, pMJ: 541, pRadz: 528, pAvg: 533, diffPct: 1.2 },
  { type: "VTM", site: "Los Pelambres 800", location: null, model: "VTM-800", units: 1, material: null, application: "Regrind", p80: 20, tph: 38.2, D: 3.25, H: 4.96, S: 1.15, rpm: 24, ratedKW: 596, shaftKW: 527, pNitta: 530, pMJ: 541, pRadz: 528, pAvg: 533, diffPct: 1.2 },
  { type: "VTM", site: "Freeport 800", location: null, model: "VTM-800", units: 1, material: null, application: "Regrind", p80: 20, tph: 30.9, D: 3.25, H: 4.96, S: 1.15, rpm: 24, ratedKW: 596, shaftKW: 527, pNitta: 530, pMJ: 541, pRadz: 528, pAvg: 533, diffPct: 1.2 },
  { type: "VTM", site: "Getchell", location: null, model: "VTM-800", units: 1, material: null, application: "Regrind", p80: 20, tph: 30.9, D: 3.25, H: 4.96, S: 1.15, rpm: 24, ratedKW: 596, shaftKW: 527, pNitta: 530, pMJ: 541, pRadz: 528, pAvg: 533, diffPct: 1.2 },
  { type: "VTM", site: "Stillwater Ni", location: null, model: "VTM-650", units: 1, material: null, application: "Regrind", p80: 50, tph: 55, D: 2.86, H: 4.85, S: 1.13, rpm: 25, ratedKW: 484, shaftKW: 428, pNitta: 433, pMJ: 418, pRadz: 437, pAvg: 429, diffPct: 0.3 },
  { type: "VTM", site: "Stillwater Au", location: null, model: "VTM-500", units: 1, material: null, application: "Regrind", p80: 30, tph: 15, D: 2.86, H: 4.26, S: 1, rpm: 26, ratedKW: 372, shaftKW: 330, pNitta: 331, pMJ: 349, pRadz: 343, pAvg: 341, diffPct: 3.3 },
  { type: "VTM", site: "Minsur", location: null, model: "VTM-500", units: 1, material: null, application: "Regrind", p80: 38, tph: 60.5, D: 2.86, H: 4.26, S: 1, rpm: 26, ratedKW: 372, shaftKW: 330, pNitta: 331, pMJ: 349, pRadz: 343, pAvg: 341, diffPct: 3.3 },
  { type: "VTM", site: "GoldCorp Red Lake", location: null, model: "VTM-500", units: 1, material: null, application: "Regrind", p80: 44, tph: 14.51, D: 2.86, H: 4.26, S: 1, rpm: 26, ratedKW: 372, shaftKW: 330, pNitta: 331, pMJ: 349, pRadz: 343, pAvg: 341, diffPct: 3.3 },
  { type: "VTM", site: "BHP Cannington 500", location: null, model: "VTM-500", units: 1, material: null, application: "Regrind", p80: 44, tph: 246.75, D: 2.86, H: 4.26, S: 1, rpm: 26, ratedKW: 372, shaftKW: 330, pNitta: 331, pMJ: 349, pRadz: 343, pAvg: 341, diffPct: 3.3 },
  { type: "VTM", site: "North American Pd 500", location: null, model: "VTM-500", units: 1, material: null, application: "Regrind", p80: 82, tph: 64.41, D: 2.86, H: 4.26, S: 1, rpm: 26, ratedKW: 372, shaftKW: 330, pNitta: 331, pMJ: 349, pRadz: 343, pAvg: 341, diffPct: 3.3 },
  { type: "VTM", site: "Hibbing Taconite", location: null, model: "VTM-500", units: 1, material: null, application: "Regrind", p80: 106, tph: 105, D: 2.86, H: 4.26, S: 1, rpm: 26, ratedKW: 372, shaftKW: 330, pNitta: 331, pMJ: 349, pRadz: 343, pAvg: 341, diffPct: 3.3 },
  { type: "VTM", site: "Antamina Cu 400", location: null, model: "VTM-400", units: 1, material: null, application: "Regrind", p80: 30, tph: 35, D: 2.34, H: 4.21, S: 1.02, rpm: 28, ratedKW: 298, shaftKW: 263, pNitta: 267, pMJ: 248, pRadz: 279, pAvg: 264, diffPct: 0.6 },
  { type: "VTM", site: "OCI Wyoming", location: null, model: "VTM-200", units: 2, material: null, application: "Regrind", p80: 44, tph: 10, D: 1.69, H: 3.72, S: 0.9, rpm: 33, ratedKW: 298, shaftKW: 263, pNitta: 265, pMJ: 238, pRadz: 294, pAvg: 266, diffPct: 1 },
  { type: "VTM", site: "Inco Voisey Bay 300", location: null, model: "VTM-300", units: 1, material: null, application: "Regrind", p80: 44, tph: 35, D: 1.95, H: 4.06, S: 1.03, rpm: 30, ratedKW: 224, shaftKW: 198, pNitta: 200, pMJ: 176, pRadz: 212, pAvg: 196, diffPct: -0.9 },
  { type: "VTM", site: "Barrick Veladero", location: null, model: "VTM-300", units: 1, material: null, application: "Regrind", p80: 45, tph: 13, D: 1.95, H: 4.06, S: 1.03, rpm: 30, ratedKW: 224, shaftKW: 198, pNitta: 200, pMJ: 176, pRadz: 212, pAvg: 196, diffPct: -0.9 },
  { type: "VTM", site: "Dayton Power", location: null, model: "VTM-250", units: 1, material: null, application: "Regrind", p80: 44, tph: 9.07, D: 1.82, H: 3.88, S: 0.95, rpm: 32, ratedKW: 186, shaftKW: 164, pNitta: 164, pMJ: 145, pRadz: 180, pAvg: 163, diffPct: -0.5 },
  { type: "VTM", site: "Los Pelambres PGM", location: null, model: "VTM-200", units: 1, material: null, application: "Regrind", p80: 30, tph: 13.6, D: 1.69, H: 3.72, S: 0.9, rpm: 33, ratedKW: 149, shaftKW: 132, pNitta: 132, pMJ: 119, pRadz: 147, pAvg: 133, diffPct: 0.6 },
  { type: "VTM", site: "Collahuasi LS", location: null, model: "VTM-200", units: 1, material: null, application: "Regrind", p80: 44, tph: 13.61, D: 1.69, H: 3.72, S: 0.9, rpm: 33, ratedKW: 149, shaftKW: 132, pNitta: 132, pMJ: 119, pRadz: 147, pAvg: 133, diffPct: 0.6 },
  { type: "VTM", site: "Craig Tri-State", location: null, model: "VTM-200", units: 1, material: null, application: "Regrind", p80: 44, tph: 13.4, D: 1.69, H: 3.72, S: 0.9, rpm: 33, ratedKW: 149, shaftKW: 132, pNitta: 132, pMJ: 119, pRadz: 147, pAvg: 133, diffPct: 0.6 },
  { type: "VTM", site: "Southern Peru", location: null, model: "VTM-200", units: 1, material: null, application: "Regrind", p80: 20, tph: 9.8, D: 1.69, H: 3.72, S: 0.9, rpm: 33, ratedKW: 149, shaftKW: 132, pNitta: 132, pMJ: 119, pRadz: 147, pAvg: 133, diffPct: 0.6 },
  { type: "VTM", site: "Inco Voisey Bay 150", location: null, model: "VTM-150", units: 1, material: null, application: "Regrind", p80: 44, tph: 10.43, D: 1.43, H: 3.97, S: 0.88, rpm: 35, ratedKW: 112, shaftKW: 99, pNitta: 100, pMJ: 93, pRadz: 114, pAvg: 103, diffPct: 3.5 },
  { type: "VTM", site: "Progress Energy", location: null, model: "VTM-125", units: 1, material: null, application: "Regrind", p80: 44, tph: 24.49, D: 1.3, H: 3.5, S: 0.8, rpm: 36, ratedKW: 93, shaftKW: 82, pNitta: 68, pMJ: 66, pRadz: 79, pAvg: 71, diffPct: -13.6 },
  { type: "VTM", site: "BHP Cannington 125", location: null, model: "VTM-125", units: 1, material: null, application: "Regrind", p80: 44, tph: 25.57, D: 1.3, H: 3.5, S: 0.8, rpm: 36, ratedKW: 93, shaftKW: 82, pNitta: 68, pMJ: 66, pRadz: 79, pAvg: 71, diffPct: -13.6 },
  { type: "VTM", site: "Aitik (Boliden)", location: null, model: "VTM-2000", units: 2, material: null, application: "Regrind", p80: 45, tph: 42, D: 4.81, H: 6.49, S: 1.55, rpm: 17, ratedKW: 2980, shaftKW: 3534, pNitta: 2657, pMJ: 2948, pRadz: 2323, pAvg: 2643, diffPct: -25.2 },
  { type: "VTM", site: "Antamina VTM-4500", location: null, model: "VTM-4500", units: 3, material: null, application: "Regrind", p80: 40, tph: 55, D: 6.5, H: 8.18, S: 1.95, rpm: 14, ratedKW: 10058, shaftKW: 11927, pNitta: 8968, pMJ: 10242, pRadz: 7252, pAvg: 8821, diffPct: -26 },
  { type: "VTM", site: "Boddington", location: null, model: "VTM-1500", units: 2, material: null, application: "Regrind", p80: 20, tph: 18, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 2235, shaftKW: 2651, pNitta: 1990, pMJ: 1976, pRadz: 1800, pAvg: 1922, diffPct: -27.5 },
  { type: "VTM", site: "Cannington VTM-1250", location: null, model: "VTM-1250", units: 1, material: null, application: "Regrind", p80: 20, tph: 12, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 931, shaftKW: 1104, pNitta: 825, pMJ: 859, pRadz: 763, pAvg: 816, diffPct: -26.1 },
  { type: "VTM", site: "Climax", location: null, model: "VTM-3000", units: 2, material: null, application: "Regrind", p80: 35, tph: 40, D: 5.85, H: 7.36, S: 1.7, rpm: 15, ratedKW: 4470, shaftKW: 5301, pNitta: 3981, pMJ: 4791, pRadz: 3344, pAvg: 4039, diffPct: -23.8 },
  { type: "VTM", site: "Gibraltar", location: null, model: "VTM-3000", units: 1, material: null, application: "Regrind", p80: 40, tph: 45, D: 5.85, H: 7.36, S: 1.7, rpm: 15, ratedKW: 2235, shaftKW: 2651, pNitta: 1991, pMJ: 2395, pRadz: 1672, pAvg: 2019, diffPct: -23.8 },
  { type: "VTM", site: "Huckleberry", location: null, model: "VTM-1250", units: 1, material: null, application: "Regrind", p80: 40, tph: 20, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 931, shaftKW: 1104, pNitta: 825, pMJ: 859, pRadz: 763, pAvg: 816, diffPct: -26.1 },
  { type: "VTM", site: "Itabira", location: null, model: "VTM-1500", units: 2, material: null, application: "Regrind", p80: 150, tph: 90, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 2235, shaftKW: 2651, pNitta: 1990, pMJ: 1976, pRadz: 1800, pAvg: 1922, diffPct: -27.5 },
  { type: "VTM", site: "Karara", location: null, model: "VTM-3000", units: 2, material: null, application: "Regrind", p80: 125, tph: 110, D: 5.85, H: 7.36, S: 1.7, rpm: 15, ratedKW: 4470, shaftKW: 5301, pNitta: 3981, pMJ: 4791, pRadz: 3344, pAvg: 4039, diffPct: -23.8 },
  { type: "VTM", site: "Las Bambas", location: null, model: "VTM-4500", units: 3, material: null, application: "Regrind", p80: 40, tph: 60, D: 6.5, H: 8.18, S: 1.95, rpm: 14, ratedKW: 10058, shaftKW: 11927, pNitta: 8968, pMJ: 10242, pRadz: 7252, pAvg: 8821, diffPct: -26 },
  { type: "VTM", site: "Mogalakwena", location: null, model: "VTM-1500", units: 1, material: null, application: "Regrind", p80: 30, tph: 25, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 1118, shaftKW: 1325, pNitta: 995, pMJ: 988, pRadz: 900, pAvg: 961, diffPct: -27.5 },
  { type: "VTM", site: "Morenci", location: null, model: "VTM-3000", units: 2, material: null, application: "Regrind", p80: 40, tph: 50, D: 5.85, H: 7.36, S: 1.7, rpm: 15, ratedKW: 4470, shaftKW: 5301, pNitta: 3981, pMJ: 4791, pRadz: 3344, pAvg: 4039, diffPct: -23.8 },
  { type: "VTM", site: "Raglan", location: null, model: "VTM-1250", units: 1, material: null, application: "Regrind", p80: 20, tph: 15, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 931, shaftKW: 1104, pNitta: 825, pMJ: 859, pRadz: 763, pAvg: 816, diffPct: -26.1 },
  { type: "VTM", site: "Sino Iron", location: null, model: "VTM-3000", units: 6, material: null, application: "Regrind", p80: 125, tph: 120, D: 5.85, H: 7.36, S: 1.7, rpm: 15, ratedKW: 13410, shaftKW: 15903, pNitta: 11944, pMJ: 14373, pRadz: 10033, pAvg: 12116, diffPct: -23.8 },
  { type: "VTM", site: "Tritton", location: null, model: "VTM-1250", units: 1, material: null, application: "Regrind", p80: 35, tph: 18, D: 3.9, H: 5.57, S: 1.36, rpm: 20, ratedKW: 931, shaftKW: 1104, pNitta: 825, pMJ: 859, pRadz: 763, pAvg: 816, diffPct: -26.1 },
  { type: "VTM", site: "Yarwun", location: null, model: "VTM-1500", units: 2, material: null, application: "Regrind", p80: 75, tph: 70, D: 3.9, H: 6.28, S: 1.49, rpm: 18.9, ratedKW: 2235, shaftKW: 2651, pNitta: 1990, pMJ: 1976, pRadz: 1800, pAvg: 1922, diffPct: -27.5 },
  { type: "JETM", site: "Datong Dongxin Mining", location: "Shanxi, China", model: "JETM1500", units: 2, material: "Iron Ore", application: "Regrind", p80: 38, tph: 9.2, D: 3, H: 10, S: 1.05, rpm: 30, ratedKW: 2236, shaftKW: 1976, pNitta: 1966, pMJ: 2005, pRadz: 2304, pAvg: 2091, diffPct: 5.9 },
  { type: "JETM", site: "Heqing Beiya Mining", location: "Yunnan, China", model: "JETM1450", units: 1, material: "Sulfur Concentrate", application: "Regrind", p80: 38, tph: 1000, D: 2.8, H: 9.5, S: 0.98, rpm: 32, ratedKW: 1080, shaftKW: 954, pNitta: 814, pMJ: 830, pRadz: 980, pAvg: 875, diffPct: -8.3 },
  { type: "JETM", site: "Heqing Beiya Mining #2", location: "Yunnan, China", model: "JETM1450", units: 1, material: "Sulfur Concentrate", application: "Regrind", p80: 38, tph: 600, D: 2.8, H: 9.5, S: 0.98, rpm: 32, ratedKW: 1080, shaftKW: 954, pNitta: 814, pMJ: 830, pRadz: 980, pAvg: 875, diffPct: -8.3 },
  { type: "JETM", site: "Confidential (SC)", location: "South Carolina, USA", model: "JETM1000", units: 1, material: "Printer Recycling", application: "Recycling", p80: 45, tph: 2.5, D: 2.2, H: 7.5, S: 0.77, rpm: 38, ratedKW: 745, shaftKW: 658, pNitta: 374, pMJ: 392, pRadz: 486, pAvg: 417, diffPct: -36.6 },
  { type: "JETM", site: "JFE Mineral Spence", location: "Chile", model: "JETM1000", units: 1, material: "Lime", application: "Lime Slaking", p80: 45, tph: 15, D: 2.2, H: 7.5, S: 0.77, rpm: 38, ratedKW: 745, shaftKW: 658, pNitta: 374, pMJ: 392, pRadz: 486, pAvg: 417, diffPct: -36.6 },
  { type: "JETM", site: "Dalian Jiat Pellet Factory", location: "Mingxi, China", model: "JETM1000", units: 2, material: "Iron Ore", application: "Pellet Feed", p80: 38, tph: 9.15, D: 2.2, H: 7.5, S: 0.77, rpm: 38, ratedKW: 1490, shaftKW: 1316, pNitta: 748, pMJ: 785, pRadz: 971, pAvg: 835, diffPct: -36.6 },
  { type: "JETM", site: "Sichuan Anning Iron & Titanium", location: "Miyi, China", model: "JETM1000", units: 1, material: "Iron Ore", application: "Regrind", p80: 38, tph: 120, D: 2.2, H: 7.5, S: 0.77, rpm: 38, ratedKW: 745, shaftKW: 658, pNitta: 374, pMJ: 392, pRadz: 486, pAvg: 417, diffPct: -36.6 },
  { type: "JETM", site: "Minera Chalcoco", location: "Peru", model: "JETM1500LS", units: 1, material: "Quick Lime", application: "Lime Slaking", p80: 45, tph: 33.2, D: 3, H: 10, S: 1.05, rpm: 30, ratedKW: 1118, shaftKW: 988, pNitta: 983, pMJ: 1002, pRadz: 1152, pAvg: 1046, diffPct: 5.9 },
  { type: "JETM", site: "Anglo American Peru", location: "Peru", model: "JETM1500LS", units: 1, material: "Quick Lime", application: "Lime Slaking", p80: 45, tph: 33.2, D: 3, H: 10, S: 1.05, rpm: 30, ratedKW: 1118, shaftKW: 988, pNitta: 983, pMJ: 1002, pRadz: 1152, pAvg: 1046, diffPct: 5.9 },
  { type: "JETM", site: "Visayas Steel Lime", location: "Philippines", model: "JETM1500LS", units: 1, material: "Quick Lime", application: "Lime Slaking", p80: 45, tph: 15.3, D: 3, H: 10, S: 1.05, rpm: 30, ratedKW: 1118, shaftKW: 988, pNitta: 983, pMJ: 1002, pRadz: 1152, pAvg: 1046, diffPct: 5.9 },
  { type: "JETM", site: "Erdenet Mining", location: "Mongolia", model: "JETM700", units: 1, material: "Copper Ore", application: "Regrind", p80: 38, tph: 80, D: 1.8, H: 6.5, S: 0.63, rpm: 42, ratedKW: 520, shaftKW: 459, pNitta: 195, pMJ: 216, pRadz: 268, pAvg: 226, diffPct: -50.8 },
  { type: "JETM", site: "Kumtor Gold Company", location: "Kyrgyzstan", model: "JETM2000", units: 1, material: "Gold Ore", application: "Regrind", p80: 38, tph: 350, D: 3.5, H: 11.5, S: 1.23, rpm: 27, ratedKW: 1490, shaftKW: 1316, pNitta: 1618, pMJ: 1609, pRadz: 1807, pAvg: 1678, diffPct: 27.5 },
  { type: "JETM", site: "Nusa Halmahera Gosowong", location: "Indonesia", model: "JETM1200", units: 1, material: "Gold Ore", application: "Regrind", p80: 38, tph: 90, D: 2.5, H: 8.5, S: 0.88, rpm: 35, ratedKW: 895, shaftKW: 791, pNitta: 577, pMJ: 589, pRadz: 720, pAvg: 629, diffPct: -20.5 },
  { type: "JETM", site: "OK Tedi Mining", location: "Papua New Guinea", model: "JETM1200", units: 2, material: "Copper Gold Ore", application: "Regrind", p80: 38, tph: 226, D: 2.5, H: 8.5, S: 0.88, rpm: 35, ratedKW: 1790, shaftKW: 1581, pNitta: 1153, pMJ: 1179, pRadz: 1440, pAvg: 1257, diffPct: -20.5 },
  { type: "JETM", site: "Resources Pellets India", location: "India", model: "JETM1000", units: 1, material: "Iron Ore Hematite", application: "Pellet Feed", p80: 38, tph: 395, D: 2.2, H: 7.5, S: 0.77, rpm: 38, ratedKW: 745, shaftKW: 658, pNitta: 374, pMJ: 392, pRadz: 486, pAvg: 417, diffPct: -36.6 },
  { type: "JETM", site: "CRITEC Cement & Tech", location: "Austria", model: "JETM1500", units: 4, material: "Magnetite Ore", application: "Regrind", p80: 38, tph: 15, D: 3, H: 10, S: 1.05, rpm: 30, ratedKW: 4472, shaftKW: 3951, pNitta: 3931, pMJ: 4009, pRadz: 4607, pAvg: 4183, diffPct: 5.9 },
  { type: "JETM", site: "Kazchrome JSC", location: "Kazakhstan", model: "JETM1000", units: 1, material: "Chrome Ore", application: "Regrind", p80: 45, tph: 5.7, D: 2.2, H: 7.5, S: 0.77, rpm: 38, ratedKW: 745, shaftKW: 658, pNitta: 374, pMJ: 392, pRadz: 486, pAvg: 417, diffPct: -36.6 },
  { type: "JETM", site: "Hosoya", location: "Shimane, Japan", model: "JETM100", units: 1, material: "Silica Sand", application: "Industrial Minerals", p80: 300, tph: 30, D: 0.6, H: 3, S: 0.21, rpm: 75, ratedKW: 75, shaftKW: 66, pNitta: 6, pMJ: 8, pRadz: 11, pAvg: 8, diffPct: -87.4 },
]
