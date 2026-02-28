import { useState, useEffect } from 'react';

interface MoveModalProps {
    moveUrl: string;
    moveName: string;
    isOpen: boolean;
    onClose: () => void;
}

interface FullMoveData {
    name: string;
    type: string;
    power: number | null;
    accuracy: number | null;
    pp: number;
    damageClass: string;
    effectChance: number | null;
    shortEffect: string;
    flavorText: string;
    ailment: string | null;
    critRate: number;
    drain: number;
    flinchChance: number;
    healing: number;
}

const TYPE_COLORS: Record<string, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

export function MoveModal({ moveUrl, moveName, isOpen, onClose }: MoveModalProps) {
    const [moveData, setMoveData] = useState<FullMoveData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !moveUrl) return;

        let isMounted = true;
        setLoading(true);
        setError(null);
        setMoveData(null);

        async function fetchMove() {
            try {
                const res = await fetch(moveUrl);
                if (!res.ok) throw new Error('Failed to fetch move data');
                const data = await res.json();

                // Get English short effect
                const effectEntry = data.effect_entries?.find(
                    (e: any) => e.language.name === 'en'
                );
                let shortEffect = effectEntry?.short_effect || '';
                if (data.effect_chance) {
                    shortEffect = shortEffect.replace('$effect_chance', data.effect_chance.toString());
                }

                // Get FRLG flavor text, fallback to latest English
                const frlgFlavor = data.flavor_text_entries?.find(
                    (f: any) => f.language.name === 'en' && f.version_group.name === 'firered-leafgreen'
                );
                const anyEnglish = data.flavor_text_entries?.filter(
                    (f: any) => f.language.name === 'en'
                );
                const flavorText = frlgFlavor?.flavor_text
                    || anyEnglish?.[anyEnglish.length - 1]?.flavor_text
                    || '';

                // Determine category for Gen III
                const typeName = data.type.name;
                const specialTypes = ['fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark'];
                let damageClass = data.damage_class.name;
                if (damageClass !== 'status') {
                    damageClass = specialTypes.includes(typeName) ? 'special' : 'physical';
                }

                if (isMounted) {
                    setMoveData({
                        name: data.name.replace(/-/g, ' '),
                        type: typeName,
                        power: data.power,
                        accuracy: data.accuracy,
                        pp: data.pp,
                        damageClass,
                        effectChance: data.effect_chance,
                        shortEffect,
                        flavorText: flavorText.replace(/\n/g, ' '),
                        ailment: data.meta?.ailment?.name !== 'none' ? data.meta?.ailment?.name : null,
                        critRate: data.meta?.crit_rate || 0,
                        drain: data.meta?.drain || 0,
                        flinchChance: data.meta?.flinch_chance || 0,
                        healing: data.meta?.healing || 0,
                    });
                }
            } catch (err) {
                if (isMounted) setError('Failed to load move data.');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchMove();
        return () => { isMounted = false; };
    }, [isOpen, moveUrl]);

    if (!isOpen) return null;

    const getCategoryIcon = (cls: string) => {
        if (cls === 'physical') return '💥 Physical';
        if (cls === 'special') return '✨ Special';
        return '🛡️ Status';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                className="gba-panel"
                style={{ width: '340px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="gba-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize' }}>{moveName.replace(/-/g, ' ')}</span>
                    <button
                        onClick={onClose}
                        style={{
                            fontFamily: 'inherit',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: 'none',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            textShadow: '2px 2px 0 var(--gba-border-main)'
                        }}
                    >
                        X
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gba-border-light)' }}>
                        Loading move data...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gba-bad)' }}>
                        {error}
                    </div>
                )}

                {/* Move Details */}
                {moveData && (
                    <div style={{ fontSize: '0.65rem' }}>
                        {/* Type + Category Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                backgroundColor: TYPE_COLORS[moveData.type] || '#888',
                                color: 'white',
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                                fontSize: '0.7rem',
                                border: '2px solid var(--gba-border-main)'
                            }}>
                                {moveData.type}
                            </span>
                            <span style={{ fontSize: '0.6rem' }}>
                                {getCategoryIcon(moveData.damageClass)}
                            </span>
                        </div>

                        {/* Stats Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.5rem',
                            textAlign: 'center',
                            marginBottom: '0.75rem',
                            padding: '0.5rem',
                            backgroundColor: 'var(--gba-bg-light)',
                            border: '2px solid var(--gba-border-light)',
                            borderRadius: '4px'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.5rem', color: 'var(--gba-border-main)', marginBottom: '0.15rem' }}>POWER</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                    {moveData.power ?? '—'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.5rem', color: 'var(--gba-border-main)', marginBottom: '0.15rem' }}>ACCURACY</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                    {moveData.accuracy ? `${moveData.accuracy}%` : '—'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.5rem', color: 'var(--gba-border-main)', marginBottom: '0.15rem' }}>PP</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                    {moveData.pp}
                                </div>
                            </div>
                        </div>

                        {/* Flavor Text */}
                        {moveData.flavorText && (
                            <div style={{
                                padding: '0.5rem',
                                backgroundColor: 'var(--gba-bg-dark)',
                                borderRadius: '4px',
                                border: '2px solid var(--gba-border-light)',
                                marginBottom: '0.75rem',
                                fontStyle: 'italic',
                                lineHeight: 1.6
                            }}>
                                "{moveData.flavorText}"
                            </div>
                        )}

                        {/* Effect */}
                        {moveData.shortEffect && (
                            <div style={{
                                padding: '0.5rem',
                                lineHeight: 1.6,
                                borderTop: '2px dashed var(--gba-border-light)',
                                paddingTop: '0.5rem'
                            }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--gba-primary)' }}>Effect: </span>
                                {moveData.shortEffect}
                            </div>
                        )}

                        {/* Extra Meta */}
                        {(moveData.ailment || moveData.critRate > 0 || moveData.drain !== 0 || moveData.flinchChance > 0 || moveData.healing > 0) && (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.3rem',
                                marginTop: '0.5rem',
                                paddingTop: '0.5rem',
                                borderTop: '2px dashed var(--gba-border-light)'
                            }}>
                                {moveData.ailment && (
                                    <span style={{
                                        padding: '0.15rem 0.4rem',
                                        backgroundColor: '#ffdddd',
                                        border: '1px solid var(--gba-bad)',
                                        borderRadius: '3px',
                                        fontSize: '0.5rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        ⚠️ {moveData.ailment}
                                    </span>
                                )}
                                {moveData.critRate > 0 && (
                                    <span style={{
                                        padding: '0.15rem 0.4rem',
                                        backgroundColor: '#fff3cd',
                                        border: '1px solid #ffc107',
                                        borderRadius: '3px',
                                        fontSize: '0.5rem'
                                    }}>
                                        🎯 High Crit
                                    </span>
                                )}
                                {moveData.drain > 0 && (
                                    <span style={{
                                        padding: '0.15rem 0.4rem',
                                        backgroundColor: '#d4edda',
                                        border: '1px solid var(--gba-good)',
                                        borderRadius: '3px',
                                        fontSize: '0.5rem'
                                    }}>
                                        🩸 Drains {moveData.drain}%
                                    </span>
                                )}
                                {moveData.drain < 0 && (
                                    <span style={{
                                        padding: '0.15rem 0.4rem',
                                        backgroundColor: '#ffdddd',
                                        border: '1px solid var(--gba-bad)',
                                        borderRadius: '3px',
                                        fontSize: '0.5rem'
                                    }}>
                                        💥 Recoil {Math.abs(moveData.drain)}%
                                    </span>
                                )}
                                {moveData.flinchChance > 0 && (
                                    <span style={{
                                        padding: '0.15rem 0.4rem',
                                        backgroundColor: '#fff3cd',
                                        border: '1px solid #ffc107',
                                        borderRadius: '3px',
                                        fontSize: '0.5rem'
                                    }}>
                                        😵 Flinch {moveData.flinchChance}%
                                    </span>
                                )}
                                {moveData.healing > 0 && (
                                    <span style={{
                                        padding: '0.15rem 0.4rem',
                                        backgroundColor: '#d4edda',
                                        border: '1px solid var(--gba-good)',
                                        borderRadius: '3px',
                                        fontSize: '0.5rem'
                                    }}>
                                        💚 Heals {moveData.healing}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
