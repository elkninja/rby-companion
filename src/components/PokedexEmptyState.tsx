import { SearchBar } from './PokemonSearch';

interface PokedexEmptyStateProps {
    onSelect: (pokemon: any) => void;
}

export function PokedexEmptyState({ onSelect }: PokedexEmptyStateProps) {
    return (
        <div className="pokedex-facade-container">
            <div className="pokedex-facade">

                {/* Top LED Section */}
                <div className="pokedex-facade-top">
                    <div className="pokedex-facade-lens-container">
                        <div className="pokedex-facade-lens">
                            <div className="pokedex-facade-lens-reflection"></div>
                        </div>
                    </div>
                    <div className="pokedex-facade-lights">
                        <div className="pokedex-facade-light red"></div>
                        <div className="pokedex-facade-light yellow"></div>
                        <div className="pokedex-facade-light green"></div>
                    </div>
                </div>

                {/* Main Screen Section */}
                <div className="pokedex-facade-screen-bezel">
                    <div className="pokedex-facade-screen-top-holes">
                        <div className="hole"></div>
                        <div className="hole"></div>
                    </div>
                    <div className="pokedex-facade-screen-glass">
                        <div className="pokedex-facade-welcome">
                            <h1><span style={{ color: '#ff6060' }}>Fire</span><span style={{ color: '#ffcccc' }}>Red</span> <br /> &amp; <span style={{ color: '#60ff60' }}>Leaf</span><span style={{ color: '#ccffcc' }}>Green</span> <br /> Companion</h1>
                            <p>DATABASE ONLINE<br /><br />AWAITING QUERY<span className="blink">_</span></p>
                        </div>
                        <div className="pokedex-facade-search-wrapper">
                            <SearchBar onSelect={onSelect} selectedPokemon={null} />
                        </div>
                    </div>

                    <div className="pokedex-facade-screen-bottom-controls">
                        <div className="pokedex-facade-dot"></div>
                        <div className="pokedex-facade-vents">
                            <div className="vent"></div>
                            <div className="vent"></div>
                            <div className="vent"></div>
                            <div className="vent"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Control Section (Decorative) */}
                <div className="pokedex-facade-bottom">
                    <div className="pokedex-facade-dpad">
                        <div className="dpad-up"></div>
                        <div className="dpad-right"></div>
                        <div className="dpad-down"></div>
                        <div className="dpad-left"></div>
                        <div className="dpad-center"></div>
                    </div>
                    <div className="pokedex-facade-green-screen"></div>
                    <div className="pokedex-facade-buttons">
                        <div className="button-a">A</div>
                        <div className="button-b">B</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
