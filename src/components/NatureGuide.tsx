import { natures } from '../utils/ivCalculator';

interface NatureGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NatureGuide({ isOpen, onClose }: NatureGuideProps) {
    if (!isOpen) return null;

    return (
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
                <div className="gba-panel-header green" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Nature Guide</span>
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

                <div style={{ marginBottom: '1rem', fontSize: '0.8rem', lineHeight: '1.5' }}>
                    <p>Natures affect a Pokémon's stats by increasing one stat by <strong style={{ color: 'var(--gba-good)' }}>10% (↑)</strong> and decreasing another by <strong style={{ color: 'var(--gba-bad)' }}>10% (↓)</strong>.</p>
                </div>

                <div style={{ overflow: 'auto', margin: '0 -0.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--gba-primary)', color: 'white' }}>
                                <th style={{ padding: '0.4rem 0.2rem', border: '2px solid var(--gba-border-main)' }}>Nature</th>
                                <th style={{ padding: '0.4rem 0.2rem', border: '2px solid var(--gba-border-main)' }}>Increased Stat (+10%)</th>
                                <th style={{ padding: '0.4rem 0.2rem', border: '2px solid var(--gba-border-main)' }}>Decreased Stat (-10%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {natures.map((nature, index) => {
                                const isNeutral = !nature.increased && !nature.decreased;
                                return (
                                    <tr key={nature.name} style={{ backgroundColor: index % 2 === 0 ? 'var(--gba-bg-light)' : 'transparent' }}>
                                        <td style={{ padding: '0.4rem 0.2rem', border: '2px solid var(--gba-border-main)', fontWeight: 'bold' }}>{nature.name}</td>

                                        {isNeutral ? (
                                            <td colSpan={2} style={{ padding: '0.4rem 0.2rem', border: '2px solid var(--gba-border-main)', textAlign: 'center', color: 'var(--gba-border-light)', fontStyle: 'italic' }}>
                                                Neutral (No Stat Changes)
                                            </td>
                                        ) : (
                                            <>
                                                <td style={{ padding: '0.4rem 0.2rem', border: '2px solid var(--gba-border-main)', color: 'var(--gba-good)' }}>
                                                    {nature.increased?.toUpperCase()} ↑
                                                </td>
                                                <td style={{ padding: '0.4rem 0.2rem', border: '2px solid var(--gba-border-main)', color: 'var(--gba-bad)' }}>
                                                    {nature.decreased?.toUpperCase()} ↓
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
