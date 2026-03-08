export type PokemonType =
    | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass'
    | 'Ice' | 'Fighting' | 'Poison' | 'Ground' | 'Flying'
    | 'Psychic' | 'Bug' | 'Rock' | 'Ghost' | 'Dragon'
    | 'Dark' | 'Steel';

// Gen 3 Type Chart: [Attacking Type][Defending Type] -> Multiplier
const typeEffectiveness: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
    Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
    Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
    Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
    Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
    Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2 },
    Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
    Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
    Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
    Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5 },
    Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
    Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5, Steel: 0.5 },
    Dragon: { Dragon: 2, Steel: 0.5 },
    Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Steel: 0.5 },
    Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5 }
};

const allTypes: PokemonType[] = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel'
];

export interface TypeMatchup {
    weaknesses: { type: PokemonType; multiplier: number }[];
    resistances: { type: PokemonType; multiplier: number }[];
    immunities: PokemonType[];
}

export function getTypeMatchup(pokemonTypes: string[]): TypeMatchup {
    const types = pokemonTypes as PokemonType[];
    const matchup: TypeMatchup = {
        weaknesses: [],
        resistances: [],
        immunities: [],
    };

    for (const attackType of allTypes) {
        let multiplier = 1;
        for (const defendType of types) {
            const effect = typeEffectiveness[attackType]?.[defendType];
            if (effect !== undefined) {
                multiplier *= effect;
            }
        }

        if (multiplier === 0) {
            matchup.immunities.push(attackType);
        } else if (multiplier > 1) {
            matchup.weaknesses.push({ type: attackType, multiplier });
        } else if (multiplier < 1) {
            matchup.resistances.push({ type: attackType, multiplier });
        }
    }

    // Sort them
    matchup.weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    matchup.resistances.sort((a, b) => a.multiplier - b.multiplier);

    return matchup;
}
