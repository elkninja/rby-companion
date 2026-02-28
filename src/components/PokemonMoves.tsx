import { useState, useEffect } from 'react';

interface MoveDetails {
    name: string;
    level: number;
    type?: string;
    category?: 'Physical' | 'Special' | 'Status';
}

interface PokemonMovesProps {
    pokemonId: number;
}

export function PokemonMoves({ pokemonId }: PokemonMovesProps) {
    const [moves, setMoves] = useState<MoveDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchMoves() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                if (!response.ok) throw new Error('Failed to fetch Pokemon data.');
                const data = await response.json();

                const frlgMoves: any[] = [];

                data.moves.forEach((moveObj: any) => {
                    // Look through version group details for FireRed/LeafGreen ('firered-leafgreen')
                    const frlgDetail = moveObj.version_group_details.find(
                        (vgd: any) => vgd.version_group.name === 'firered-leafgreen' && vgd.move_learn_method.name === 'level-up'
                    );

                    if (frlgDetail) {
                        frlgMoves.push({
                            name: moveObj.move.name.replace('-', ' '),
                            level: frlgDetail.level_learned_at,
                            url: moveObj.move.url
                        });
                    }
                });

                // Sort by level ascending
                frlgMoves.sort((a, b) => a.level - b.level);

                // Fetch details for each move to get Type and Damage Class
                const detailedMoves = await Promise.all(
                    frlgMoves.map(async (m) => {
                        const mRes = await fetch(m.url);
                        const mData = await mRes.json();

                        const typeName = mData.type.name;
                        let category: 'Physical' | 'Special' | 'Status' = 'Status';

                        if (mData.damage_class.name !== 'status') {
                            const specialTypes = ['fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark'];
                            category = specialTypes.includes(typeName) ? 'Special' : 'Physical';
                        }

                        return {
                            name: m.name,
                            level: m.level,
                            type: typeName,
                            category: category
                        };
                    })
                );

                if (isMounted) {
                    setMoves(detailedMoves);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'An error occurred fetching moves.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchMoves();

        return () => {
            isMounted = false;
        };
    }, [pokemonId]);

    if (loading) {
        return (
            <div className="gba-panel" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--gba-border-light)' }}>Loading Pokédex Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gba-panel" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--gba-bad)' }}>{error}</p>
            </div>
        );
    }

    if (moves.length === 0) {
        return null;
    }

    return (
        <div className="gba-panel" style={{ marginTop: '1rem' }}>
            <div className="gba-panel-header" style={{ marginBottom: 0 }}>
                <span>Learned Moves</span>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '0 -1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Level</th>
                            <th style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Move Name</th>
                            <th style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Type</th>
                            <th style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Cat.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moves.map((move, index) => (
                            <tr key={`${move.name}-${index}`} style={{ backgroundColor: index % 2 === 0 ? 'var(--gba-bg-light)' : 'transparent' }}>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--gba-bg-dark)' }}>
                                    {move.level === 1 ? '--' : move.level}
                                </td>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--gba-bg-dark)', textTransform: 'capitalize' }}>
                                    {move.name}
                                </td>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--gba-bg-dark)', textTransform: 'capitalize' }}>
                                    {move.type}
                                </td>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--gba-bg-dark)' }}>
                                    {move.category === 'Physical' ? '💥 Phys' : (move.category === 'Special' ? '✨ Spec' : '🛡️ Stat')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

