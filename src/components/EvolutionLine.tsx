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
    trigger?: string; // e.g. "Lv. 16", "Thunder Stone", "Trade"
}

function getEvolutionTriggerLabel(details: any): string {
    if (!details || details.length === 0) return '';
    const d = details[0]; // Take the first evolution detail
    const trigger = d.trigger?.name;

    if (trigger === 'level-up') {
        if (d.min_level) return `Lv. ${d.min_level}`;
        if (d.min_happiness) return 'Friendship';
        return 'Level Up';
    }
    if (trigger === 'use-item' && d.item) {
        return d.item.name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    }
    if (trigger === 'trade') {
        if (d.held_item) {
            return `Trade (${d.held_item.name.replace(/-/g, ' ')})`;
        }
        return 'Trade';
    }
    return '';
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
                    // Extract ID from species URL
                    const urlParts = currentStage.species.url.split('/');
                    const id = parseInt(urlParts[urlParts.length - 2], 10);

                    // Only include Gen 1 Pokemon (id <= 151)
                    if (id <= 151) {
                        parsedStages.push({
                            name: currentStage.species.name,
                            id: id,
                            url: currentStage.species.url,
                            trigger: getEvolutionTriggerLabel(currentStage.evolution_details)
                        });
                    }

                    currentStage = currentStage.evolves_to[0];
                } while (currentStage && currentStage.evolves_to);

                // For Eevee and branched evolutions in Gen 1
                if (evoData.chain.evolves_to.length > 1) {
                    const extraBranches: EvolutionStage[] = [];
                    evoData.chain.evolves_to.forEach((branch: any) => {
                        const urlParts = branch.species.url.split('/');
                        const id = parseInt(urlParts[urlParts.length - 2], 10);
                        if (id <= 151 && !parsedStages.find(s => s.id === id)) {
                            extraBranches.push({
                                name: branch.species.name,
                                id: id,
                                url: branch.species.url,
                                trigger: getEvolutionTriggerLabel(branch.evolution_details)
                            });
                        }
                    });
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {stages.map((stage, index) => {
                    const isSelected = stage.id === pokemon.id;
                    const isBase = index === 0 || (stages.length > 3 && index === 0); // Base form has no trigger
                    const showArrow = index < stages.length - 1
                        && stages[index + 1].id !== stages[0].id
                        && !stages[index].name.includes('eevee');

                    return (
                        <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                onClick={() => {
                                    if (!isSelected) {
                                        const localPokemon = pokemonData.find(p => p.id === stage.id);
                                        if (localPokemon) {
                                            onSelect(localPokemon);
                                        }
                                    }
                                }}
                                style={{
                                    cursor: isSelected ? 'default' : 'pointer',
                                    padding: '0.25rem',
                                    border: isSelected ? '4px solid var(--gba-primary)' : '4px dashed var(--gba-border-light)',
                                    borderRadius: '8px',
                                    backgroundColor: isSelected ? 'var(--gba-panel-bg)' : 'var(--gba-bg-light)',
                                    textAlign: 'center',
                                    opacity: isSelected ? 1 : 0.7,
                                    transition: 'all 0.1s',
                                    boxSizing: 'border-box',
                                    width: '104px',
                                    minHeight: '92px'
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
                                {!isBase && stage.trigger && (
                                    <div style={{
                                        fontSize: '0.45rem',
                                        color: 'var(--gba-primary)',
                                        fontWeight: 'bold',
                                        marginTop: '0.15rem',
                                        lineHeight: 1.2
                                    }}>
                                        {stage.trigger}
                                    </div>
                                )}
                            </div>
                            {showArrow && (
                                <div style={{ margin: '0 0.3rem', color: 'var(--gba-border-light)' }}>▶</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
