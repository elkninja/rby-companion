import { getTypeMatchup } from '../utils/typeChart';
import type { PokemonType } from '../utils/typeChart';

interface PokemonResistancesProps {
    types: string[];
}

export function PokemonResistances({ types }: PokemonResistancesProps) {
    const matchup = getTypeMatchup(types);

    const TypePill = ({ type, multiplier }: { type: PokemonType | string; multiplier?: number }) => {
        let bgColor = "var(--gba-bg-light)";
        let fontColor = "var(--gba-text-main)";

        if (multiplier === 4) { bgColor = "var(--gba-bad)"; fontColor = "white"; }
        else if (multiplier === 2) { bgColor = "var(--gba-bad)"; fontColor = "white"; }
        else if (multiplier === 0.5) { bgColor = "var(--gba-good)"; fontColor = "white"; }
        else if (multiplier === 0.25) { bgColor = "var(--gba-good)"; fontColor = "white"; }
        else if (multiplier === 0) { bgColor = "var(--gba-border-main)"; fontColor = "white"; }

        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: bgColor,
                    border: '1px solid var(--gba-border-main)',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    color: fontColor,
                }}
            >
                <span>{type}</span>
                {multiplier !== undefined && <span>{multiplier}x</span>}
            </span>
        );
    };

    return (
        <div className="gba-panel" style={{ marginTop: '1rem' }}>
            <div className="gba-panel-header" style={{ marginBottom: '0.5rem' }}>
                <span>Type Effectiveness</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {matchup.weaknesses.length > 0 && (
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--gba-bad)' }}>Weaknesses</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {matchup.weaknesses.map(w => (
                                <TypePill key={w.type} type={w.type} multiplier={w.multiplier} />
                            ))}
                        </div>
                    </div>
                )}

                {matchup.resistances.length > 0 && (
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--gba-good)' }}>Resistances</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {matchup.resistances.map(r => (
                                <TypePill key={r.type} type={r.type} multiplier={r.multiplier} />
                            ))}
                        </div>
                    </div>
                )}

                {matchup.immunities.length > 0 && (
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--gba-border-main)' }}>Immunities</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {matchup.immunities.map(i => (
                                <TypePill key={i} type={i} multiplier={0} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
