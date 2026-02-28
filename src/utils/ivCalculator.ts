export type StatType = 'hp' | 'attack' | 'defense' | 'spAtk' | 'spDef' | 'speed';

export type Nature = {
    name: string;
    increased: StatType | null;
    decreased: StatType | null;
};

export const natures: Nature[] = [
    { name: 'Adamant', increased: 'attack', decreased: 'spAtk' },
    { name: 'Bashful', increased: null, decreased: null },
    { name: 'Bold', increased: 'defense', decreased: 'attack' },
    { name: 'Brave', increased: 'attack', decreased: 'speed' },
    { name: 'Calm', increased: 'spDef', decreased: 'attack' },
    { name: 'Careful', increased: 'spDef', decreased: 'spAtk' },
    { name: 'Docile', increased: null, decreased: null },
    { name: 'Gentle', increased: 'spDef', decreased: 'defense' },
    { name: 'Hardy', increased: null, decreased: null },
    { name: 'Hasty', increased: 'speed', decreased: 'defense' },
    { name: 'Impish', increased: 'defense', decreased: 'spAtk' },
    { name: 'Jolly', increased: 'speed', decreased: 'spAtk' },
    { name: 'Lax', increased: 'defense', decreased: 'spDef' },
    { name: 'Lonely', increased: 'attack', decreased: 'defense' },
    { name: 'Mild', increased: 'spAtk', decreased: 'defense' },
    { name: 'Modest', increased: 'spAtk', decreased: 'attack' },
    { name: 'Naive', increased: 'speed', decreased: 'spDef' },
    { name: 'Naughty', increased: 'attack', decreased: 'spDef' },
    { name: 'Quiet', increased: 'spAtk', decreased: 'speed' },
    { name: 'Quirky', increased: null, decreased: null },
    { name: 'Rash', increased: 'spAtk', decreased: 'spDef' },
    { name: 'Relaxed', increased: 'defense', decreased: 'speed' },
    { name: 'Sassy', increased: 'spDef', decreased: 'speed' },
    { name: 'Serious', increased: null, decreased: null },
    { name: 'Timid', increased: 'speed', decreased: 'attack' },
];

export interface IvInput {
    baseStat: number;
    level: number;
    statValue: number;
    ev: number;
    statType: StatType;
    nature: Nature;
}

/**
 * Calculates a specific stat based on the Gen 3 formula.
 */
export function calculateStat(base: number, iv: number, ev: number, level: number, natureMult: number, isHp: boolean): number {
    if (isHp) {
        return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    }
    const stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    return Math.floor(stat * natureMult);
}

/**
 * Returns the possible range of IVs (0-31) that result in the given actual stat value.
 */
export function getPossibleIvs(input: IvInput): { min: number; max: number } | null {
    const { baseStat, level, statValue, ev, statType, nature } = input;
    let natureMult = 1.0;
    if (nature.increased === statType) natureMult = 1.1;
    if (nature.decreased === statType) natureMult = 0.9;

    const isHp = statType === 'hp';

    let validIvs: number[] = [];

    for (let iv = 0; iv <= 31; iv++) {
        const calc = calculateStat(baseStat, iv, ev, level, natureMult, isHp);
        if (calc === statValue) {
            validIvs.push(iv);
        }
    }

    if (validIvs.length === 0) return null; // Impossible stat

    return {
        min: validIvs[0],
        max: validIvs[validIvs.length - 1]
    };
}
