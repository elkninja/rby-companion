import { useState } from 'react';
import type { Nature } from '../utils/ivCalculator';

interface IvRange {
    min: number;
    max: number;
}

interface IvResultsProps {
    ivs: {
        hp: IvRange | null;
        attack: IvRange | null;
        defense: IvRange | null;
        spAtk: IvRange | null;
        spDef: IvRange | null;
        speed: IvRange | null;
    } | null;
    nature: Nature | null;
    onSave: () => void;
}

export function IvResults({ ivs, nature, onSave }: IvResultsProps) {
    const [threshold, setThreshold] = useState<number>(20);

    // Simple heuristic: If the *average minimum IV* across all 6 stats is >= threshold, KEEP.
    // Can be adjusted to look at max, or specific stats.
    const calculateResult = () => {
        if (!ivs) return 'INVALID';
        const stats = [ivs.hp, ivs.attack, ivs.defense, ivs.spAtk, ivs.spDef, ivs.speed];
        if (stats.some(s => s === null)) return 'INVALID'; // Missing data

        const totalMin = stats.reduce((acc, curr) => acc + (curr?.min || 0), 0);
        const avgMin = totalMin / 6;

        return avgMin >= threshold ? 'KEEP' : 'TOSS';
    };

    const displayRange = (range: IvRange | null) => {
        if (!range) return '??';
        if (range.min === range.max) return `${range.min}`;
        return `${range.min}-${range.max}`;
    };

    const getIvColor = (range: IvRange | null) => {
        if (!range) return 'inherit';
        if (range.min >= 25) return 'var(--gba-good)';
        if (range.max <= 10) return 'var(--gba-bad)';
        return 'inherit';
    };

    const getNatureIndicator = (statName: string) => {
        if (!nature) return null;
        if (nature.increased === statName) {
            return <span style={{ color: 'var(--gba-good)', marginLeft: '2px' }}>↑</span>;
        }
        if (nature.decreased === statName) {
            return <span style={{ color: 'var(--gba-bad)', marginLeft: '2px' }}>↓</span>;
        }
        return null;
    }

    const resultStatus = calculateResult();

    return (
        <div>
            <div style={{ borderTop: '2px solid var(--gba-border-main)', margin: '0.5rem 0', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Threshold:</span>
                    <input
                        type="number"
                        className="gba-input"
                        style={{ width: '50px', padding: '0.2rem', fontSize: '0.65rem' }}
                        value={threshold}
                        onChange={e => setThreshold(parseInt(e.target.value, 10) || 0)}
                        min="0" max="31"
                    />
                </div>

                <div className="stat-grid-3" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--gba-border-main)' }}>HP</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: getIvColor(ivs?.hp || null) }}>{displayRange(ivs?.hp || null)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--gba-border-main)' }}>Atk{getNatureIndicator('attack')}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: getIvColor(ivs?.attack || null) }}>{displayRange(ivs?.attack || null)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--gba-border-main)' }}>Def{getNatureIndicator('defense')}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: getIvColor(ivs?.defense || null) }}>{displayRange(ivs?.defense || null)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--gba-border-main)' }}>Sp.A{getNatureIndicator('spAtk')}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: getIvColor(ivs?.spAtk || null) }}>{displayRange(ivs?.spAtk || null)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--gba-border-main)' }}>Sp.D{getNatureIndicator('spDef')}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: getIvColor(ivs?.spDef || null) }}>{displayRange(ivs?.spDef || null)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--gba-border-main)' }}>Spe{getNatureIndicator('speed')}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: getIvColor(ivs?.speed || null) }}>{displayRange(ivs?.speed || null)}</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '0.5rem', minHeight: '30px' }}>
                    {resultStatus === 'KEEP' && <div className="gba-stamp keep" style={{ fontSize: '1rem' }}>KEEP!</div>}
                    {resultStatus === 'TOSS' && <div className="gba-stamp toss" style={{ fontSize: '1rem' }}>TOSS</div>}
                    {resultStatus === 'INVALID' && <div style={{ fontSize: '0.6rem', color: 'var(--gba-bad)' }}>Enter stats above</div>}
                </div>

                <button className="gba-button" onClick={onSave} disabled={resultStatus === 'INVALID'} style={{ fontSize: '0.7rem', padding: '0.4rem' }}>
                    Save to PC
                </button>
            </div>
        </div>
    );
}
