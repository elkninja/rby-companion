import { useState, useEffect } from 'react';

interface SavedEntry {
    date: string;
    pokemon: string;
    level: number;
    nature: string;
    ivs: {
        hp: { min: number; max: number } | null;
        attack: { min: number; max: number } | null;
        defense: { min: number; max: number } | null;
        spAtk: { min: number; max: number } | null;
        spDef: { min: number; max: number } | null;
        speed: { min: number; max: number } | null;
    };
}

interface SavedPokemonProps {
    isOpen: boolean;
    onSelect?: (entry: any) => void;
    onClose: () => void;
}

export function SavedPokemon({ isOpen, onSelect, onClose }: SavedPokemonProps) {
    const [saved, setSaved] = useState<SavedEntry[]>([]);

    useEffect(() => {
        if (isOpen) {
            const data = JSON.parse(localStorage.getItem('rby_saved') || '[]');
            setSaved(data.reverse()); // Show newest first
        }
    }, [isOpen]);

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear your PC Box?')) {
            localStorage.removeItem('rby_saved');
            setSaved([]);
        }
    };

    const getMinIvs = (ivs: SavedEntry['ivs']) => {
        const stats = [ivs.hp, ivs.attack, ivs.defense, ivs.spAtk, ivs.spDef, ivs.speed];
        let total = 0;
        let count = 0;
        stats.forEach(s => {
            if (s) {
                total += s.min;
                count++;
            }
        });
        if (count === 0) return 0;
        return Math.round(total / count);
    }

    return (
        <>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="gba-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="gba-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>PC Box (Saved)</span>
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

                        {saved.length === 0 ? (
                            <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>Box is empty.</p>
                        ) : (
                            <>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                                    {saved.map((entry, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                if (onSelect) onSelect(entry);
                                            }}
                                            style={{
                                                borderBottom: '2px solid var(--gba-border-main)',
                                                padding: '0.5rem 0',
                                                fontSize: '0.7rem',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.1s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gba-highlight)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <strong style={{ color: 'var(--gba-primary)' }}>{entry.pokemon} (Lv{entry.level})</strong>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--gba-border-light)', fontSize: '0.5rem' }}>
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const updated = saved.filter((_, index) => index !== i);
                                                            setSaved(updated);
                                                            localStorage.setItem('rby_saved_pokemon', JSON.stringify(updated));
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--gba-red)',
                                                            cursor: 'pointer',
                                                            padding: '0 0.2rem',
                                                            fontFamily: 'inherit',
                                                            fontSize: '0.6rem'
                                                        }}
                                                        title="Release"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Avg Min IV: <strong style={{ color: getMinIvs(entry.ivs) >= 20 ? 'var(--gba-good)' : 'var(--gba-text-main)' }}>{getMinIvs(entry.ivs)}</strong></span>
                                                <span>{entry.nature}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={clearHistory}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        backgroundColor: 'transparent',
                                        border: '2px solid var(--gba-border-main)',
                                        color: 'var(--gba-text-main)',
                                        fontFamily: 'inherit',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer'
                                    }}>
                                    Release All
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
