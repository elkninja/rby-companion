interface SpriteModalProps {
    pokemon: any | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SpriteModal({ pokemon, isOpen, onClose }: SpriteModalProps) {
    if (!isOpen || !pokemon) return null;

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
            <div className="gba-panel" style={{ width: 'auto', height: 'auto', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <div className="gba-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize' }}>{pokemon.name}</span>
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

                <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${pokemon.id}.png`}
                    alt={pokemon.name}
                    style={{
                        imageRendering: 'pixelated',
                        width: '300px',
                        height: '300px',
                        backgroundColor: 'var(--gba-bg-light)',
                        border: '4px solid var(--gba-border-main)',
                        borderRadius: '8px',
                        boxShadow: 'inset 4px 4px 0px 0px rgba(0,0,0,0.1)',
                        margin: '1rem auto'
                    }}
                />
            </div>
        </div>
    );
}
