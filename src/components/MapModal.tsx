import { useEffect } from 'react';
import { KantoMap } from './KantoMap';

interface EncounterHighlight {
    locationName: string;
    info: string;
}

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    focusLocation?: string;
    encounterHighlights?: EncounterHighlight[];
    pokemonName?: string;
}

export function MapModal({ isOpen, onClose, focusLocation, encounterHighlights = [], pokemonName }: MapModalProps) {
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const title = focusLocation
        ? focusLocation
        : pokemonName
            ? `${pokemonName} — Encounter Locations`
            : 'Kanto Map';

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                border: '4px solid var(--gba-border-main)',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--gba-panel-bg)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--gba-neutral)',
                    color: 'white',
                    padding: '0.4rem 0.75rem',
                    borderBottom: '4px solid var(--gba-border-main)',
                    fontSize: '0.75rem',
                    textShadow: '2px 2px 0 rgba(0,0,0,0.3)'
                }}>
                    <span>🗺️ {title}</span>
                    <button
                        onClick={onClose}
                        style={{
                            fontFamily: 'inherit',
                            fontSize: '0.55rem',
                            backgroundColor: 'var(--gba-primary)',
                            color: 'white',
                            border: '2px solid rgba(0,0,0,0.3)',
                            borderRadius: '4px',
                            padding: '0.2rem 0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ✕ Close
                    </button>
                </div>

                {/* Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <KantoMap
                        focusLocation={focusLocation}
                        encounterHighlights={encounterHighlights}
                        height="100%"
                    />
                </div>

                {/* Footer - Attribution */}
                {encounterHighlights.length > 0 && (
                    <div style={{
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.45rem',
                        color: 'var(--gba-border-light)',
                        borderTop: '2px solid var(--gba-bg-dark)',
                        textAlign: 'center'
                    }}>
                        {encounterHighlights.length} location{encounterHighlights.length !== 1 ? 's' : ''} highlighted
                        {pokemonName && ` for ${pokemonName}`}
                        {' · Click highlighted areas for details'}
                    </div>
                )}
            </div>
        </div>
    );
}
