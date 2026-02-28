import { useState, useEffect } from 'react';
import pokemonData from '../data/pokemon.json';

interface EvolutionLineProps {
    pokemon: any;
    onSelect: (pokemon: any) => void;
}

interface EvolutionStage {
    name: string;
    id: number;
    url: string;
}

export function EvolutionLine({ pokemon, onSelect }: EvolutionLineProps) {
    const [stages, setStages] = useState<EvolutionStage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchEvolutionLine() {
            setLoading(true);
            try {
                // 1. Fetch species to get evolution-chain URL
                const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`);
                const speciesData = await speciesRes.json();

                // 2. Fetch evolution chain
                const evoRes = await fetch(speciesData.evolution_chain.url);
                const evoData = await evoRes.json();

                // 3. Parse stages (traverse the tree structure)
                const parsedStages: EvolutionStage[] = [];
                let currentStage = evoData.chain;

                do {
                    // Extract ID from species URL (e.g., "https://pokeapi.co/api/v2/pokemon-species/1/")
                    const urlParts = currentStage.species.url.split('/');
                    const id = parseInt(urlParts[urlParts.length - 2], 10);

                    // Only include Gen 1 Pokemon (id <= 151)
                    if (id <= 151) {
                        parsedStages.push({
                            name: currentStage.species.name,
                            id: id,
                            url: currentStage.species.url
                        });
                    }

                    currentStage = currentStage.evolves_to[0]; // Assuming linear evolution for Gen 1 for simplicity (Eevee handled, but we just take first branch if linear else we'd need more logic)
                } while (currentStage && currentStage.evolves_to);

                // For Eevee and branched evolutions in Gen 1 like Vileplume/Bellossom(Gen2)
                // Let's make sure we catch multiple branches if they exist inside `evolves_to`
                if (evoData.chain.evolves_to.length > 1) {
                    const extraBranches: EvolutionStage[] = [];
                    evoData.chain.evolves_to.forEach((branch: any) => {
                        const urlParts = branch.species.url.split('/');
                        const id = parseInt(urlParts[urlParts.length - 2], 10);
                        if (id <= 151 && !parsedStages.find(s => s.id === id)) {
                            extraBranches.push({
                                name: branch.species.name,
                                id: id,
                                url: branch.species.url
                            });
                        }
                    });
                    // Push any extra branches (like Vaporeon, Jolteon, Flareon)
                    extraBranches.forEach(b => parsedStages.push(b));
                }

                if (isMounted) {
                    setStages(parsedStages);
                }
            } catch (error) {
                console.error("Failed to fetch evolution line:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (pokemon) {
            fetchEvolutionLine();
        }

        return () => { isMounted = false; };
    }, [pokemon]);

    if (loading) return null;
    if (stages.length <= 1) return null; // Don't show if it doesn't evolve

    return (
        <div className="gba-panel" style={{ marginTop: '0' }}>
            <div className="gba-panel-header" style={{ marginBottom: '1rem', backgroundColor: 'var(--gba-neutral)' }}>
                Evolution Line
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {stages.map((stage, index) => {
                    const isSelected = stage.id === pokemon.id;
                    return (
                        <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                onClick={() => {
                                    if (!isSelected) {
                                        // Find exactly the pokemon from the local list
                                        const localPokemon = pokemonData.find(p => p.id === stage.id);
                                        if (localPokemon) {
                                            onSelect(localPokemon);
                                        }
                                    }
                                }}
                                style={{
                                    cursor: isSelected ? 'default' : 'pointer',
                                    padding: '0.25rem', // Reduced padding since border is thicker 
                                    border: isSelected ? '4px solid var(--gba-primary)' : '4px dashed var(--gba-border-light)',
                                    borderRadius: '8px',
                                    backgroundColor: isSelected ? 'var(--gba-panel-bg)' : 'var(--gba-bg-light)',
                                    textAlign: 'center',
                                    opacity: isSelected ? 1 : 0.7,
                                    transition: 'all 0.1s',
                                    boxSizing: 'border-box',
                                    width: '104px', // Fixed width to prevent shifting
                                    height: '92px' // Fixed height to prevent shifting
                                }}
                                onMouseOver={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.borderColor = 'var(--gba-border-main)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.opacity = '0.7';
                                        e.currentTarget.style.borderColor = 'var(--gba-border-light)';
                                    }
                                }}
                            >
                                <img
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${stage.id}.png`}
                                    alt={stage.name}
                                    style={{ imageRendering: 'pixelated', width: '56px', height: '56px', margin: '0 auto' }}
                                />
                                <div style={{ fontSize: '0.6rem', textTransform: 'capitalize' }}>{stage.name}</div>
                            </div>
                            {index < stages.length - 1 && stages[index + 1].id !== stages[0].id && !stages[index].name.includes('eevee') && ( // simple check to not put arrows between eevees
                                <div style={{ margin: '0 0.5rem', color: 'var(--gba-border-light)' }}>▶</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
