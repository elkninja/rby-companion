import { useEffect, useState } from 'react';

interface EncounterDetail {
    min_level: number;
    max_level: number;
    chance: number;
    method: {
        name: string;
        url: string;
    };
}

interface VersionDetail {
    version: {
        name: string;
        url: string;
    };
    max_chance: number;
    encounter_details: EncounterDetail[];
}

interface LocationArea {
    location_area: {
        name: string;
        url: string;
    };
    version_details: VersionDetail[];
}

interface ProcessedEncounter {
    locationName: string;
    version: 'firered' | 'leafgreen' | 'both';
    methods: string[];
    minLevel: number;
    maxLevel: number;
    maxChance: number;
}

interface PokemonLocationsProps {
    pokemonId: number;
    onLocationClick?: (locationName: string) => void;
    onLocationsLoaded?: (locations: ProcessedEncounter[]) => void;
}

export function PokemonLocations({ pokemonId, onLocationClick, onLocationsLoaded }: PokemonLocationsProps) {
    const [locations, setLocations] = useState<ProcessedEncounter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchLocations() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
                if (!response.ok) throw new Error('Failed to fetch encounters');
                const data: LocationArea[] = await response.json();

                const processed: ProcessedEncounter[] = [];

                data.forEach(area => {
                    // Filter for FRLG only
                    const frlgVersions = area.version_details.filter(vd =>
                        vd.version.name === 'firered' || vd.version.name === 'leafgreen'
                    );

                    if (frlgVersions.length > 0) {
                        const hasFR = frlgVersions.some(v => v.version.name === 'firered');
                        const hasLG = frlgVersions.some(v => v.version.name === 'leafgreen');
                        const versionState = (hasFR && hasLG) ? 'both' : (hasFR ? 'firered' : 'leafgreen');

                        // Clean up location name
                        const locationName = area.location_area.name
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())
                            .replace(' Area', ''); // e.g. "Kanto Route 1 Area" -> "Kanto Route 1"

                        // Aggregate methods and levels
                        const methods = new Set<string>();
                        let minLevel = 100;
                        let maxLevel = 1;
                        let maxChance = 0;

                        frlgVersions.forEach(v => {
                            if (v.max_chance > maxChance) maxChance = v.max_chance;
                            v.encounter_details.forEach(ed => {
                                methods.add(ed.method.name.replace(/-/g, ' '));
                                if (ed.min_level < minLevel) minLevel = ed.min_level;
                                if (ed.max_level > maxLevel) maxLevel = ed.max_level;
                            });
                        });

                        processed.push({
                            locationName,
                            version: versionState,
                            methods: Array.from(methods),
                            minLevel,
                            maxLevel,
                            maxChance
                        });
                    }
                });

                if (isMounted) {
                    setLocations(processed);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Error loading locations.');
                    setLoading(false);
                }
            }
        }

        fetchLocations();

        return () => {
            isMounted = false;
        };
    }, [pokemonId]);

    // Notify parent when locations are loaded
    useEffect(() => {
        if (onLocationsLoaded && !loading) {
            onLocationsLoaded(locations);
        }
    }, [locations, loading]);

    if (loading) {
        return (
            <div className="gba-panel">
                <div className="gba-panel-header blue">Locations</div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>Searching map...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gba-panel">
                <div className="gba-panel-header blue">Locations</div>
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--gba-bad)' }}>{error}</div>
            </div>
        );
    }

    return (
        <div className="gba-panel">
            <div className="gba-panel-header blue">Locations</div>

            <div style={{ overflow: 'auto', maxHeight: '400px', margin: '0 -0.5rem' }}>
                {locations.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                        This Pokémon cannot be found in the wild in FireRed or LeafGreen.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--gba-bg-light)', zIndex: 1, boxShadow: '0 2px 0 var(--gba-border-main)' }}>
                            <tr>
                                <th style={{ padding: '0.4rem 0.2rem', textAlign: 'left' }}>Location</th>
                                <th style={{ padding: '0.4rem 0.2rem', textAlign: 'center' }}>Game</th>
                                <th style={{ padding: '0.4rem 0.2rem', textAlign: 'center' }}>Lvl</th>
                                <th style={{ padding: '0.4rem 0.2rem', textAlign: 'center' }}>Method</th>
                                <th style={{ padding: '0.4rem 0.2rem', textAlign: 'center' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((loc, idx) => (
                                <tr
                                    key={idx}
                                    style={{
                                        borderBottom: '2px solid var(--gba-border-light)',
                                        cursor: onLocationClick ? 'pointer' : 'default',
                                        transition: 'background-color 0.1s'
                                    }}
                                    onClick={() => onLocationClick && onLocationClick(loc.locationName)}
                                    onMouseEnter={(e) => {
                                        if (onLocationClick) e.currentTarget.style.backgroundColor = 'var(--gba-highlight)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <td style={{ padding: '0.4rem 0.2rem' }}>
                                        {onLocationClick && <span style={{ marginRight: '0.3rem', fontSize: '0.5rem' }}>📍</span>}
                                        {loc.locationName}
                                    </td>
                                    <td style={{ padding: '0.4rem 0.2rem', textAlign: 'center' }}>
                                        {loc.version === 'both' ? 'FR/LG' : loc.version === 'firered' ? <span style={{ color: '#d9534f', fontWeight: 'bold' }}>FR</span> : <span style={{ color: '#5cb85c', fontWeight: 'bold' }}>LG</span>}
                                    </td>
                                    <td style={{ padding: '0.4rem 0.2rem', textAlign: 'center' }}>{loc.minLevel === loc.maxLevel ? loc.minLevel : `${loc.minLevel}-${loc.maxLevel}`}</td>
                                    <td style={{ padding: '0.4rem 0.2rem', textAlign: 'center', textTransform: 'capitalize' }}>{loc.methods.join(', ')}</td>
                                    <td style={{ padding: '0.4rem 0.2rem', textAlign: 'center' }}>{loc.maxChance}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
