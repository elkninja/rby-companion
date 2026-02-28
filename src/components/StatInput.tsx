import type { Nature } from '../utils/ivCalculator';
import { natures } from '../utils/ivCalculator';

interface StatInputProps {
    level: number;
    setLevel: (lvl: number) => void;
    nature: Nature;
    setNature: (n: Nature) => void;
    stats: {
        hp: number | string;
        attack: number | string;
        defense: number | string;
        spAtk: number | string;
        spDef: number | string;
        speed: number | string;
    };
    setStats: (stats: any) => void;
}

export function StatInput({ level, setLevel, nature, setNature, stats, setStats }: StatInputProps) {

    const handleStatChange = (statName: string, value: string) => {
        const num = parseInt(value, 10);
        setStats({
            ...stats,
            [statName]: isNaN(num) ? '' : num
        });
    };

    return (
        <div>
            <div className="stat-grid" style={{ marginBottom: '0.5rem' }}>
                <div className="gba-input-group">
                    <label style={{ fontSize: '0.65rem' }}>Level</label>
                    <input
                        type="number"
                        className="gba-input"
                        value={level || ''}
                        onChange={e => setLevel(parseInt(e.target.value, 10) || 0)}
                        min="1" max="100"
                        style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                    />
                </div>

                <div className="gba-input-group">
                    <label style={{ fontSize: '0.65rem' }}>Nature</label>
                    <select
                        className="gba-select"
                        value={nature.name}
                        onChange={e => {
                            const selected = natures.find(n => n.name === e.target.value);
                            if (selected) setNature(selected);
                        }}
                        style={{ padding: '0.25rem', fontSize: '0.65rem' }}
                    >
                        {natures.map(n => (
                            <option key={n.name} value={n.name}>{n.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="stat-grid-3">
                <div className="gba-input-group">
                    <label style={{ fontSize: '0.6rem' }}>HP</label>
                    <input type="number" className="gba-input" style={{ padding: '0.25rem', fontSize: '0.7rem' }} value={stats.hp} onChange={e => handleStatChange('hp', e.target.value)} />
                </div>
                <div className="gba-input-group">
                    <label style={{ fontSize: '0.6rem' }}>Attack</label>
                    <input type="number" className="gba-input" style={{ padding: '0.25rem', fontSize: '0.7rem' }} value={stats.attack} onChange={e => handleStatChange('attack', e.target.value)} />
                </div>
                <div className="gba-input-group">
                    <label style={{ fontSize: '0.6rem' }}>Defense</label>
                    <input type="number" className="gba-input" style={{ padding: '0.25rem', fontSize: '0.7rem' }} value={stats.defense} onChange={e => handleStatChange('defense', e.target.value)} />
                </div>
                <div className="gba-input-group">
                    <label style={{ fontSize: '0.6rem' }}>Sp. Atk</label>
                    <input type="number" className="gba-input" style={{ padding: '0.25rem', fontSize: '0.7rem' }} value={stats.spAtk} onChange={e => handleStatChange('spAtk', e.target.value)} />
                </div>
                <div className="gba-input-group">
                    <label style={{ fontSize: '0.6rem' }}>Sp. Def</label>
                    <input type="number" className="gba-input" style={{ padding: '0.25rem', fontSize: '0.7rem' }} value={stats.spDef} onChange={e => handleStatChange('spDef', e.target.value)} />
                </div>
                <div className="gba-input-group">
                    <label style={{ fontSize: '0.6rem' }}>Speed</label>
                    <input type="number" className="gba-input" style={{ padding: '0.25rem', fontSize: '0.7rem' }} value={stats.speed} onChange={e => handleStatChange('speed', e.target.value)} />
                </div>
            </div>
        </div>
    );
}
