import { calculateStat } from '../utils/ivCalculator';

interface PokemonBaseStatsProps {
    base: {
        hp: number;
        attack: number;
        defense: number;
        spAtk: number;
        spDef: number;
        speed: number;
    };
}

export function PokemonBaseStats({ base }: PokemonBaseStatsProps) {

    // HP: IV 0 EV 0 -> IV 31 EV 252 (Nature doesn't affect HP)
    const hpMin = calculateStat(base.hp, 0, 0, 100, 1.0, true);
    const hpMax = calculateStat(base.hp, 31, 252, 100, 1.0, true);

    // Other Stats: Min -> IV 0 EV 0 Nature 0.9 | Max -> IV 31 EV 252 Nature 1.1
    const calcMin = (baseVal: number) => calculateStat(baseVal, 0, 0, 100, 0.9, false);
    const calcMax = (baseVal: number) => calculateStat(baseVal, 31, 252, 100, 1.1, false);

    const statsList = [
        { label: 'HP', baseVal: base.hp, min: hpMin, max: hpMax, color: 'var(--gba-good)' },
        { label: 'ATK', baseVal: base.attack, min: calcMin(base.attack), max: calcMax(base.attack), color: 'var(--gba-bad)' },
        { label: 'DEF', baseVal: base.defense, min: calcMin(base.defense), max: calcMax(base.defense), color: 'var(--gba-primary)' },
        { label: 'SP. ATK', baseVal: base.spAtk, min: calcMin(base.spAtk), max: calcMax(base.spAtk), color: 'var(--gba-secondary)' },
        { label: 'SP. DEF', baseVal: base.spDef, min: calcMin(base.spDef), max: calcMax(base.spDef), color: '#a050ff' }, // custom purple for sp def
        { label: 'SPD', baseVal: base.speed, min: calcMin(base.speed), max: calcMax(base.speed), color: '#ffb020' }, // custom orange for speed
    ];

    const StatBar = ({ value, color, maxPossible = 255 }: { value: number; color: string; maxPossible?: number }) => {
        const percentage = Math.min((value / maxPossible) * 100, 100);
        return (
            <div style={{ flex: 1, backgroundColor: 'var(--gba-bg-dark)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, backgroundColor: color, height: '100%', borderRadius: '4px' }} />
            </div>
        );
    };

    return (
        <div className="gba-panel" style={{ marginTop: '1rem' }}>
            <div className="gba-panel-header" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <span>Base Stats</span>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255, 255, 255, 0.7)', marginLeft: 'auto', fontWeight: 'normal' }}>(Lv. 100)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {statsList.map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: '0.65rem' }}>
                        <div style={{ width: '55px', fontWeight: 'bold', color: 'var(--gba-text-main)', paddingRight: '0.2rem' }}>{s.label}</div>
                        <div style={{ width: '30px', textAlign: 'right', paddingRight: '10px' }}>{s.baseVal}</div>
                        <StatBar value={s.baseVal} color={s.color} />
                        <div style={{ width: '90px', textAlign: 'right', fontSize: '0.6rem', color: 'var(--gba-border-main)' }}>
                            {s.min} - {s.max}
                        </div>
                    </div>
                ))}

                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.65rem', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid var(--gba-border-main)' }}>
                    <div style={{ width: '55px', fontWeight: 'bold', paddingRight: '0.2rem' }}>Total</div>
                    <div style={{ width: '30px', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
                        {base.hp + base.attack + base.defense + base.spAtk + base.spDef + base.speed}
                    </div>
                    <div style={{ flex: 1 }} />
                </div>
            </div>
        </div>
    );
}
