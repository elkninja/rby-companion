// Map location bounds extracted from pkmnmap.com
// pkmnmap.com stores coordinates with axes swapped:
//   their L.latLng(lat, lng) actually stores (game_x, game_y)
// We swap to get proper CRS.Simple coordinates: L.latLng(game_y, game_x)

export interface LocationBounds {
    name: string;
    pokeApiNames: string[];
    sw: [number, number]; // [lat, lng] - southWest corner
    ne: [number, number]; // [lat, lng] - northEast corner
}

// Swap axes: pkmnmap stores (x, y) as (lat, lng), but CRS.Simple needs (y, x)
function swap(sw: [number, number], ne: [number, number]): { sw: [number, number]; ne: [number, number] } {
    return {
        sw: [sw[1], sw[0]],
        ne: [ne[1], ne[0]]
    };
}

// All Kanto overworld locations
export const kantoLocations: LocationBounds[] = [
    { name: "Pallet Town", pokeApiNames: ["Kanto Pallet Town", "Pallet Town"], ...swap([29.998, -139.989], [41.997, -129.99]) },
    { name: "Route 1", pokeApiNames: ["Kanto Route 1"], ...swap([29.998, -129.99], [41.997, -109.991]) },
    { name: "Viridian City", pokeApiNames: ["Kanto Viridian City", "Viridian City"], ...swap([23.998, -109.991], [47.996, -89.993]) },
    { name: "Route 2", pokeApiNames: ["Kanto Route 2", "Kanto Route 2 South Towards Viridian City"], ...swap([29.998, -89.993], [41.997, -49.996]) },
    { name: "Pewter City", pokeApiNames: ["Kanto Pewter City", "Pewter City"], ...swap([23.998, -49.996], [47.996, -29.998]) },
    { name: "Route 3", pokeApiNames: ["Kanto Route 3"], ...swap([47.996, -44.996], [89.993, -34.997]) },
    { name: "Route 4", pokeApiNames: ["Kanto Route 4"], ...swap([77.994, -34.997], [131.99, -24.998]) },
    { name: "Cerulean City", pokeApiNames: ["Kanto Cerulean City", "Cerulean City"], ...swap([131.99, -39.997], [155.988, -19.998]) },
    { name: "Route 5", pokeApiNames: ["Kanto Route 5"], ...swap([131.99, -59.995], [155.988, -39.997]) },
    { name: "Route 6", pokeApiNames: ["Kanto Route 6"], ...swap([137.989, -99.992], [149.988, -79.994]) },
    { name: "Route 7", pokeApiNames: ["Kanto Route 7"], ...swap([119.991, -74.994], [131.99, -64.995]) },
    { name: "Route 8", pokeApiNames: ["Kanto Route 8"], ...swap([155.988, -74.994], [191.985, -64.995]) },
    { name: "Route 9", pokeApiNames: ["Kanto Route 9"], ...swap([155.988, -34.997], [191.985, -24.998]) },
    { name: "Route 10", pokeApiNames: ["Kanto Route 10"], ...swap([191.985, -64.995], [203.984, -24.998]) },
    { name: "Route 11", pokeApiNames: ["Kanto Route 11"], ...swap([155.988, -114.991], [191.985, -104.992]) },
    { name: "Route 12", pokeApiNames: ["Kanto Route 12"], ...swap([191.985, -134.989], [203.984, -74.994]) },
    { name: "Route 13", pokeApiNames: ["Kanto Route 13"], ...swap([167.987, -144.989], [203.984, -134.989]) },
    { name: "Route 14", pokeApiNames: ["Kanto Route 14"], ...swap([155.988, -164.987], [167.987, -134.989]) },
    { name: "Route 15", pokeApiNames: ["Kanto Route 15"], ...swap([119.991, -164.987], [155.988, -154.988]) },
    { name: "Route 16", pokeApiNames: ["Kanto Route 16"], ...swap([65.995, -74.994], [89.993, -64.995]) },
    { name: "Route 17", pokeApiNames: ["Kanto Route 17"], ...swap([65.995, -154.988], [77.994, -74.994]) },
    { name: "Route 18", pokeApiNames: ["Kanto Route 18"], ...swap([65.995, -164.987], [95.992, -154.988]) },
    { name: "Route 19", pokeApiNames: ["Kanto Route 19"], ...swap([101.992, -199.984], [113.991, -169.987]) },
    { name: "Route 20", pokeApiNames: ["Kanto Route 20"], ...swap([41.997, -199.984], [101.992, -189.985]) },
    { name: "Route 21", pokeApiNames: ["Kanto Route 21"], ...swap([29.998, -189.985], [41.997, -139.989]) },
    { name: "Route 22", pokeApiNames: ["Kanto Route 22"], ...swap([0, -106.992], [23.998, -94.993]) },
    { name: "Route 23", pokeApiNames: ["Kanto Route 23"], ...swap([0, -94.993], [11.999, -5]) },
    { name: "Route 24", pokeApiNames: ["Kanto Route 24"], ...swap([137.989, -19.998], [149.988, 0]) },
    { name: "Route 25", pokeApiNames: ["Kanto Route 25"], ...swap([149.988, -9.999], [185.985, 0]) },
    { name: "Celadon City", pokeApiNames: ["Kanto Celadon City", "Celadon City"], ...swap([89.993, -79.994], [119.991, -59.995]) },
    { name: "Cinnabar Island", pokeApiNames: ["Kanto Cinnabar Island", "Cinnabar Island"], ...swap([29.998, -199.984], [41.997, -189.985]) },
    { name: "Fuchsia City", pokeApiNames: ["Kanto Fuchsia City", "Fuchsia City"], ...swap([95.992, -169.987], [119.991, -149.988]) },
    { name: "Lavender Town", pokeApiNames: ["Kanto Lavender Town", "Lavender Town"], ...swap([191.985, -74.994], [203.984, -64.995]) },
    { name: "Saffron City", pokeApiNames: ["Kanto Saffron City", "Saffron City"], ...swap([131.99, -79.994], [155.988, -59.995]) },
    { name: "Vermilion City", pokeApiNames: ["Kanto Vermilion City", "Vermilion City"], ...swap([131.99, -119.991], [155.988, -99.992]) }
];

// Map interior/dungeon locations to their overworld entrance
const interiorToOverworld: Record<string, string> = {
    'kanto safari zone': 'Fuchsia City',
    'kanto safari zone center': 'Fuchsia City',
    'kanto safari zone east': 'Fuchsia City',
    'kanto safari zone north': 'Fuchsia City',
    'kanto safari zone west': 'Fuchsia City',
    'pokemon tower': 'Lavender Town',
    'kanto pokemon tower': 'Lavender Town',
    'power plant': 'Route 10',
    'kanto power plant': 'Route 10',
    'mt moon': 'Route 4',
    'kanto mt moon': 'Route 4',
    'rock tunnel': 'Route 10',
    'kanto rock tunnel': 'Route 10',
    'victory road': 'Route 23',
    'kanto victory road': 'Route 23',
    'cerulean cave': 'Cerulean City',
    'kanto cerulean cave': 'Cerulean City',
    'seafoam islands': 'Route 20',
    'kanto seafoam islands': 'Route 20',
    'pokemon mansion': 'Cinnabar Island',
    'kanto pokemon mansion': 'Cinnabar Island',
    'digletts cave': 'Route 2',
    'kanto digletts cave': 'Route 2',
    'viridian forest': 'Route 2',
    'kanto viridian forest': 'Route 2',
    'ss anne': 'Vermilion City',
    'kanto ss anne': 'Vermilion City',
};

// Utility: Find a location by name (exact match, with interior fallback)
export function findLocationByName(locationName: string): LocationBounds | undefined {
    const normalized = locationName.toLowerCase().trim();

    // 1. Try exact match against pokeApiNames and location names
    const exact = kantoLocations.find(loc =>
        loc.pokeApiNames.some(n => normalized === n.toLowerCase()) ||
        normalized === loc.name.toLowerCase()
    );
    if (exact) return exact;

    // 2. Try interior-to-overworld mapping
    const overworldName = interiorToOverworld[normalized];
    if (overworldName) {
        return kantoLocations.find(loc => loc.name === overworldName);
    }

    // 3. Partial match fallback for names with extra suffixes (e.g. "Kanto Safari Zone Center")
    for (const [key, target] of Object.entries(interiorToOverworld)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return kantoLocations.find(loc => loc.name === target);
        }
    }

    return undefined;
}

// Map center and bounds (in swapped coordinate system)
// After swap: lat spans [-200, 0], lng spans [0, 210]
export const KANTO_CENTER: [number, number] = [-100, 105];
export const KANTO_BOUNDS: [[number, number], [number, number]] = [[-215, -10], [10, 220]];
