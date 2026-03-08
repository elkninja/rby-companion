import { useState, useEffect } from 'react';
import { MoveModal } from './MoveModal';

interface MoveDetails {
    name: string;
    level: number;
    learnMethod: string;
    type?: string;
    category?: 'Physical' | 'Special' | 'Status';
    url?: string;
}

interface PokemonMovesProps {
    pokemonId: number;
}

export function PokemonMoves({ pokemonId }: PokemonMovesProps) {
    const [moves, setMoves] = useState<MoveDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMove, setSelectedMove] = useState<{ url: string; name: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'level-up' | 'machine'>('level-up');

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
                        (vgd: any) => vgd.version_group.name === 'firered-leafgreen' &&
                            (vgd.move_learn_method.name === 'level-up' || vgd.move_learn_method.name === 'machine')
                    );

                    if (frlgDetail) {
                        frlgMoves.push({
                            name: moveObj.move.name.replace('-', ' '),
                            level: frlgDetail.level_learned_at,
                            learnMethod: frlgDetail.move_learn_method.name,
                            url: moveObj.move.url
                        });
                    }
                });

                // Sort by level ascending, but put TMs at the end
                frlgMoves.sort((a, b) => {
                    if (a.learnMethod === 'machine' && b.learnMethod === 'level-up') return 1;
                    if (a.learnMethod === 'level-up' && b.learnMethod === 'machine') return -1;
                    return a.level - b.level;
                });

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
                            learnMethod: m.learnMethod,
                            type: typeName,
                            category: category,
                            url: m.url
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

        // Reset tab to level-up when pokemon changes
        setActiveTab('level-up');

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

    const filteredMoves = moves.filter(m => m.learnMethod === activeTab);

    return (
        <div className="gba-panel" style={{ marginTop: '1rem' }}>
            <div className="gba-panel-header" style={{ marginBottom: 0 }}>
                <span>Learned Moves</span>
            </div>

            <div style={{ display: 'flex', borderBottom: '2px solid var(--gba-border-main)', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                <button
                    onClick={() => setActiveTab('level-up')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: activeTab === 'level-up' ? 'var(--gba-border-main)' : 'transparent',
                        color: activeTab === 'level-up' ? 'white' : 'var(--gba-text-main)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.65rem'
                    }}
                >
                    Level Up
                </button>
                <button
                    onClick={() => setActiveTab('machine')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: activeTab === 'machine' ? 'var(--gba-border-main)' : 'transparent',
                        color: activeTab === 'machine' ? 'white' : 'var(--gba-text-main)',
                        border: 'none',
                        borderLeft: '2px solid var(--gba-border-main)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.65rem'
                    }}
                >
                    TM / HM
                </button>
            </div>

            <div style={{ margin: '0 -0.5rem' }}>
                {filteredMoves.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--gba-border-light)' }}>
                        No moves found for this category.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                {activeTab === 'level-up' && (
                                    <th style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Level</th>
                                )}
                                <th style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Move Name</th>
                                <th style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Type</th>
                                <th className="hide-on-mobile" style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 0 var(--gba-border-main)', position: 'sticky', top: 0, backgroundColor: 'var(--gba-panel-bg)', zIndex: 1 }}>Cat.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMoves.map((move, index) => (
                                <tr
                                    key={`${move.name}-${index}`}
                                    onClick={() => move.url && setSelectedMove({ url: move.url, name: move.name })}
                                    style={{
                                        backgroundColor: index % 2 === 0 ? 'var(--gba-bg-light)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.1s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--gba-highlight)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--gba-bg-light)' : 'transparent'}
                                >
                                    {activeTab === 'level-up' && (
                                        <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--gba-bg-dark)' }}>
                                            {move.level === 1 ? '--' : move.level}
                                        </td>
                                    )}
                                    <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--gba-bg-dark)', textTransform: 'capitalize' }}>
                                        {move.name}
                                    </td>
                                    <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid var(--gba-bg-dark)', textTransform: 'capitalize' }}>
                                        {move.type}
                                    </td>
                                    <td className="hide-on-mobile" style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--gba-bg-dark)' }}>
                                        {move.category === 'Physical' ? '💥 Phys' : (move.category === 'Special' ? '✨ Spec' : '🛡️ Stat')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <MoveModal
                moveUrl={selectedMove?.url || ''}
                moveName={selectedMove?.name || ''}
                isOpen={!!selectedMove}
                onClose={() => setSelectedMove(null)}
            />
        </div>
    );
}

