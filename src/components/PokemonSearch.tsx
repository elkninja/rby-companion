import { useState, useEffect, useRef } from 'react';
import pokemonData from '../data/pokemon.json';
import { getVersionAvailability } from '../utils/versionExclusives';

// Reusable version badge component
function VersionBadges({ pokemonId, size = 'normal' }: { pokemonId: number; size?: 'small' | 'normal' }) {
    const avail = getVersionAvailability(pokemonId);
    const fontSize = size === 'small' ? '0.5rem' : '0.55rem';
    const padding = size === 'small' ? '1px 4px' : '2px 5px';

    return (
        <span style={{ display: 'inline-flex', gap: '3px' }}>
            <span style={{
                fontSize,
                padding,
                borderRadius: '3px',
                backgroundColor: avail === 'LG' ? '#ccc' : '#d9534f',
                color: avail === 'LG' ? '#999' : 'white',
                fontWeight: 'bold',
                opacity: avail === 'LG' ? 0.4 : 1,
                lineHeight: 1,
            }}>FR</span>
            <span style={{
                fontSize,
                padding,
                borderRadius: '3px',
                backgroundColor: avail === 'FR' ? '#ccc' : '#5cb85c',
                color: avail === 'FR' ? '#999' : 'white',
                fontWeight: 'bold',
                opacity: avail === 'FR' ? 0.4 : 1,
                lineHeight: 1,
            }}>LG</span>
        </span>
    );
}

interface Pokemon {
    id: number;
    name: string;
    type: string[];
    base: {
        hp: number;
        attack: number;
        defense: number;
        spAtk: number;
        spDef: number;
        speed: number;
    };
}

import type { ReactNode } from 'react';

// ====== Search Bar (for the header) ======
interface SearchBarProps {
    onSelect: (pokemon: Pokemon) => void;
    selectedPokemon?: Pokemon | null;
}

export function SearchBar({ onSelect, selectedPokemon }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Pokemon[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (selectedPokemon) {
            setQuery(selectedPokemon.name);
        }
    }, [selectedPokemon]);

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = (pokemonData as Pokemon[]).filter(
            p => p.name.toLowerCase().startsWith(lowerQuery) || p.id.toString() === query
        ).slice(0, 5);
        setResults(filtered);
    }, [query]);

    const handleSelect = (pokemon: Pokemon) => {
        setQuery(pokemon.name);
        setShowDropdown(false);
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        onSelect(pokemon);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <input
                type="text"
                className="gba-input"
                placeholder="SEARCH POKEMON"
                value={query}
                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                }}
                onFocus={() => { if (query) setShowDropdown(true); }}
            />

            {showDropdown && results.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: '-1.5rem',
                    width: 'calc(100% + 3rem)',
                    backgroundColor: 'var(--gba-panel-bg)',
                    border: '3px solid var(--gba-border-main)',
                    borderRadius: '4px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {results.map((pokemon) => {
                        return (
                            <div
                                key={pokemon.id}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input from losing focus prematurely
                                    handleSelect(pokemon);
                                }}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    cursor: 'pointer',
                                    borderBottom: '2px solid var(--gba-bg-dark)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.75rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gba-highlight)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                                    <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${pokemon.id}.png`}
                                        alt={pokemon.name}
                                        style={{ imageRendering: 'pixelated', width: '32px', height: '32px' }}
                                    />
                                    <span>#{pokemon.id.toString().padStart(3, '0')}</span>
                                    <span>{pokemon.name}</span>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <VersionBadges pokemonId={pokemon.id} size="small" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

// ====== Pokémon Card (display only) ======
interface PokemonCardProps {
    selectedPokemon: Pokemon | null;
    onSpriteClick?: () => void;
    rightHeaderContent?: ReactNode;
}

export function PokemonCard({ selectedPokemon, onSpriteClick, rightHeaderContent }: PokemonCardProps) {
    if (!selectedPokemon) return null;

    return (
        <div className="gba-panel">
            <div className="gba-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>#{selectedPokemon.id.toString().padStart(3, '0')} {selectedPokemon.name}</span>
                {rightHeaderContent}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div
                    className="pokedex-screen"
                    style={{
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        width: '100%',
                        height: '160px',
                        borderRadius: '8px 8px 8px 32px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => onSpriteClick && onSpriteClick()}
                    title="View full sprite"
                >
                    <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${selectedPokemon.id}.png`}
                        alt={selectedPokemon.name}
                        style={{
                            imageRendering: 'pixelated',
                            width: '128px',
                            height: '128px',
                            marginTop: '12px'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {selectedPokemon.type.map((t) => (
                            <span key={t} style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                border: '2px solid var(--gba-border-main)',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                backgroundColor: 'var(--gba-bg-light)'
                            }}>
                                {t}
                            </span>
                        ))}
                    </div>
                    <VersionBadges pokemonId={selectedPokemon.id} />
                </div>
            </div>
        </div>
    );
}
