import { useState, useEffect } from 'react';
import './styles/gba.css';
import { SearchBar, PokemonCard } from './components/PokemonSearch';
import { StatInput } from './components/StatInput';
import { IvResults } from './components/IvResults';
import { PokemonMoves } from './components/PokemonMoves';
import { SpriteModal } from './components/SpriteModal';
import { EvolutionLine } from './components/EvolutionLine';
import { SavedPokemon } from './components/SavedPokemon';
import { NatureGuide } from './components/NatureGuide';
import { PokemonLocations } from './components/PokemonLocations';
import { MapModal } from './components/MapModal';
import { DexterChat } from './components/DexterChat';
import { PokedexEmptyState } from './components/PokedexEmptyState';
import { PokemonBaseStats } from './components/PokemonBaseStats';
import { PokemonResistances } from './components/PokemonResistances';
import { natures, getPossibleIvs } from './utils/ivCalculator';
import type { Nature } from './utils/ivCalculator';

function App() {
  // ... existing state ...
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [level, setLevel] = useState<number>(5);
  const [nature, setNature] = useState<Nature>(natures[0]);
  const [isNatureGuideOpen, setIsNatureGuideOpen] = useState(false);
  const [isSpriteModalOpen, setIsSpriteModalOpen] = useState(false);
  const [stats, setStats] = useState<{
    hp: number | string;
    attack: number | string;
    defense: number | string;
    spAtk: number | string;
    spDef: number | string;
    speed: number | string;
  }>({
    hp: '',
    attack: '',
    defense: '',
    spAtk: '',
    spDef: '',
    speed: ''
  });

  const [ivs, setIvs] = useState<any>(null);
  const [isPcBoxOpen, setIsPcBoxOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapFocusLocation, setMapFocusLocation] = useState<string | undefined>(undefined);
  const [encounterHighlights, setEncounterHighlights] = useState<{ locationName: string; info: string }[]>([]);

  useEffect(() => {
    if (!selectedPokemon || !level) {
      setIvs(null);
      return;
    }

    // Only calculate if all stats are numbers
    const statValues = Object.values(stats);
    if (statValues.some(v => v === '' || isNaN(Number(v)))) {
      setIvs(null);
      return;
    }

    const baseStats = selectedPokemon.base;

    const calcIvs = {
      hp: getPossibleIvs({ baseStat: baseStats.hp, level, statValue: Number(stats.hp), ev: 0, statType: 'hp', nature }),
      attack: getPossibleIvs({ baseStat: baseStats.attack, level, statValue: Number(stats.attack), ev: 0, statType: 'attack', nature }),
      defense: getPossibleIvs({ baseStat: baseStats.defense, level, statValue: Number(stats.defense), ev: 0, statType: 'defense', nature }),
      spAtk: getPossibleIvs({ baseStat: baseStats.spAtk, level, statValue: Number(stats.spAtk), ev: 0, statType: 'spAtk', nature }),
      spDef: getPossibleIvs({ baseStat: baseStats.spDef, level, statValue: Number(stats.spDef), ev: 0, statType: 'spDef', nature }),
      speed: getPossibleIvs({ baseStat: baseStats.speed, level, statValue: Number(stats.speed), ev: 0, statType: 'speed', nature }),
    };

    setIvs(calcIvs);

  }, [selectedPokemon, level, nature, stats]);

  const handleSave = () => {
    // Basic LocalStorage save Implementation
    if (!selectedPokemon || !ivs) return;

    const saved = JSON.parse(localStorage.getItem('rby_saved') || '[]');
    saved.push({
      date: new Date().toISOString(),
      pokemon: selectedPokemon.name, // Legacy string
      level,
      nature: nature.name,          // Legacy string
      ivs,
      pokemonObject: selectedPokemon,
      natureObject: nature,
      stats: stats
    });
    localStorage.setItem('rby_saved', JSON.stringify(saved));
    alert(`${selectedPokemon.name} saved to PC!`);
  };

  const handleLoadSaved = (entry: any) => {
    // If saving from a legacy version before we stored the full objects, 
    // we can't fully restore it perfectly without a DB lookup. 
    // So we'll skip if it's missing the full objects.
    if (!entry.pokemonObject || !entry.natureObject || !entry.stats) {
      alert("Cannot reload legacy save data. Please save a new calculation first.");
      return;
    }
    setSelectedPokemon(entry.pokemonObject);
    setLevel(entry.level);
    setNature(entry.natureObject);
    setStats(entry.stats);
    setIsPcBoxOpen(false);
  };

  return (
    <div>
      {/* Only show the compact header bar when a Pokémon is selected */}
      {selectedPokemon && (
        <div className="pokedex-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="pokedex-led" />
            <h1><span style={{ color: '#ff6060' }}>Fire</span><span style={{ color: '#ffcccc' }}>Red</span><span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span><span style={{ color: '#60ff60' }}>Leaf</span><span style={{ color: '#ccffcc' }}>Green</span></h1>
          </div>
          <div className="header-search">
            <SearchBar onSelect={setSelectedPokemon} selectedPokemon={selectedPokemon} />
          </div>
          <div className="header-actions">
            <button
              onClick={() => { setMapFocusLocation(undefined); setIsMapOpen(true); }}
              style={{ backgroundColor: 'var(--gba-neutral)', color: 'white' }}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setIsPcBoxOpen(!isPcBoxOpen)}
              style={{ backgroundColor: 'var(--gba-secondary)', color: 'white' }}
            >
              📦 PC Box
            </button>
            <button
              onClick={() => setIsNatureGuideOpen(true)}
              style={{ backgroundColor: 'var(--gba-panel-bg)', color: 'var(--gba-primary)' }}
            >
              📖 Natures
            </button>
          </div>
        </div>
      )}

      {selectedPokemon ? (
        <>
          <div className="split-layout-grid">
            {/* Left Column (1/3 Width): Pokemon Card + IV Calculator */}
            <div className="dashboard-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
              <PokemonCard
                selectedPokemon={selectedPokemon}
                onSpriteClick={() => setIsSpriteModalOpen(true)}
              />

              <PokemonBaseStats base={selectedPokemon.base} />
              <PokemonResistances types={selectedPokemon.type} />

              <div className="gba-panel">
                <div className="gba-panel-header green">IV Calculator</div>
                <StatInput
                  level={level} setLevel={setLevel}
                  nature={nature} setNature={setNature}
                  stats={stats} setStats={setStats}
                />
                <IvResults ivs={ivs} nature={nature} onSave={handleSave} />
              </div>
            </div>

            {/* Right Column (2/3 Width): Evo Line, Locations & Moves */}
            <div className="dashboard-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
              <EvolutionLine pokemon={selectedPokemon} onSelect={setSelectedPokemon} />
              <PokemonLocations
                pokemonId={selectedPokemon.id}
                onLocationClick={(locationName) => {
                  setMapFocusLocation(locationName);
                  setIsMapOpen(true);
                }}
                onLocationsLoaded={(locs) => {
                  setEncounterHighlights(locs.map(loc => ({
                    locationName: loc.locationName,
                    info: `Lv.${loc.minLevel === loc.maxLevel ? loc.minLevel : loc.minLevel + '-' + loc.maxLevel} (${loc.maxChance}%)`
                  })));
                }}
              />
              <PokemonMoves pokemonId={selectedPokemon.id} />
            </div>
          </div>
        </>
      ) : (
        <PokedexEmptyState onSelect={setSelectedPokemon} />
      )}

      <SavedPokemon isOpen={isPcBoxOpen} onSelect={handleLoadSaved} onClose={() => setIsPcBoxOpen(false)} />
      <NatureGuide isOpen={isNatureGuideOpen} onClose={() => setIsNatureGuideOpen(false)} />

      <SpriteModal
        pokemon={selectedPokemon}
        isOpen={isSpriteModalOpen}
        onClose={() => setIsSpriteModalOpen(false)}
      />

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        focusLocation={mapFocusLocation}
        encounterHighlights={encounterHighlights}
        pokemonName={selectedPokemon?.name}
      />

      <DexterChat selectedPokemon={selectedPokemon} />

      <footer className="legal-footer">
        <p>
          Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK Inc.
          <br />
          This project is a non-profit fan-made tool and is not affiliated with Nintendo.
          <br />
          Data and sprites provided by <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Licensed under <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer">Apache-2.0</a>.
          View the source on <a href="https://github.com/emitch/rby-companion" target="_blank" rel="noreferrer">GitHub</a>.
        </p>
        <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
          <strong>Privacy Notice:</strong> All API keys (Gemini, ElevenLabs) are stored securely in your browser's local storage and are never sent to our servers.
        </p>
      </footer>
    </div>
  );
}

export default App;
