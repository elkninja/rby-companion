export const fireRedExclusives = new Set([
    23, 24, // Ekans, Arbok
    43, 44, 45, // Oddish, Gloom, Vileplume
    54, 55, // Psyduck, Golduck
    58, 59, // Growlithe, Arcanine
    90, 91, // Shellder, Cloyster
    123, // Scyther
    125, // Electabuzz
]);

export const leafGreenExclusives = new Set([
    27, 28, // Sandshrew, Sandslash
    37, 38, // Vulpix, Ninetales
    69, 70, 71, // Bellsprout, Weepinbell, Victreebel
    79, 80, // Slowpoke, Slowbro
    120, 121, // Staryu, Starmie
    126, // Magmar
    127, // Pinsir
]);

export function getVersionAvailability(pokemonId: number): 'FR' | 'LG' | 'Both' {
    if (fireRedExclusives.has(pokemonId)) return 'FR';
    if (leafGreenExclusives.has(pokemonId)) return 'LG';
    return 'Both';
}
