import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KANTO_CENTER, KANTO_BOUNDS, findLocationByName } from '../data/locationCoordinates';

interface EncounterHighlight {
    locationName: string;
    info: string; // e.g. "Lv.2-5 (50%)"
}

interface KantoMapProps {
    focusLocation?: string; // If set, zooms to this location
    encounterHighlights?: EncounterHighlight[]; // Locations to highlight
    height?: string;
}

export function KantoMap({ focusLocation, encounterHighlights = [], height = '100%' }: KantoMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Single effect: create map, add highlights, set view
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Clean up previous map if it exists
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
            crs: L.CRS.Simple,
            minZoom: 2,
            maxZoom: 6,
            zoomControl: true,
            attributionControl: true
        });

        // Add tile layer (self-hosted tiles)
        L.tileLayer('/map-tiles/{z}/{x}/{y}.png', {
            minZoom: 2,
            maxZoom: 6,
            tileSize: 256,
            noWrap: true,
            attribution: 'Map tiles by <a href="https://pkmnmap.com" target="_blank">Jaxson Keenes</a>'
        }).addTo(map);

        // Add encounter highlight rectangles
        const highlightBounds: L.LatLngBounds[] = [];

        encounterHighlights.forEach((highlight) => {
            const loc = findLocationByName(highlight.locationName);
            if (!loc) {
                console.warn('Could not find location:', highlight.locationName);
                return;
            }

            const bounds = L.latLngBounds(
                L.latLng(loc.sw[0], loc.sw[1]),
                L.latLng(loc.ne[0], loc.ne[1])
            );
            highlightBounds.push(bounds);

            // Create a feature group for this location (prevents SVG path merging)
            const group = L.featureGroup().addTo(map);

            // Add highlighted rectangle using polygon (4 corners)
            const corners: L.LatLngExpression[] = [
                [loc.sw[0], loc.sw[1]],
                [loc.sw[0], loc.ne[1]],
                [loc.ne[0], loc.ne[1]],
                [loc.ne[0], loc.sw[1]]
            ];
            const rect = L.polygon(corners, {
                color: '#ff4444',
                weight: 2,
                fillColor: '#ff4444',
                fillOpacity: 0.2
            }).addTo(group);

            // Add popup with encounter info
            rect.bindPopup(
                `<div style="font-family: 'Press Start 2P', monospace; font-size: 0.5rem; line-height: 1.6;">` +
                `<strong>${loc.name}</strong><br/>${highlight.info}</div>`,
                { className: 'gba-popup' }
            );

            // Add a label at the center
            const center = bounds.getCenter();
            const label = L.divIcon({
                className: 'map-location-label',
                html: `<div style="
                    font-family: 'Press Start 2P', monospace;
                    font-size: 0.4rem;
                    color: white;
                    background: rgba(208, 48, 48, 0.85);
                    padding: 2px 4px;
                    border-radius: 3px;
                    white-space: nowrap;
                    border: 1px solid rgba(0,0,0,0.3);
                    text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
                ">${loc.name}</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
            });
            L.marker(center, { icon: label, interactive: false }).addTo(group);
        });

        // Set the view
        if (focusLocation) {
            const loc = findLocationByName(focusLocation);
            if (loc) {
                const bounds = L.latLngBounds(
                    L.latLng(loc.sw[0], loc.sw[1]),
                    L.latLng(loc.ne[0], loc.ne[1])
                );
                map.fitBounds(bounds, { padding: [60, 60], maxZoom: 5 });
            } else {
                console.warn('Focus location not found:', focusLocation);
                map.setView(L.latLng(KANTO_CENTER[0], KANTO_CENTER[1]), 2);
            }
        } else if (highlightBounds.length > 0) {
            // Fit to show all highlighted locations
            let combined = highlightBounds[0];
            highlightBounds.forEach(b => combined = combined.extend(b));
            map.fitBounds(combined, { padding: [50, 50], maxZoom: 4 });
        } else {
            map.setView(L.latLng(KANTO_CENTER[0], KANTO_CENTER[1]), 2);
        }

        // Set max bounds with padding
        map.setMaxBounds(L.latLngBounds(
            L.latLng(KANTO_BOUNDS[0][0] - 50, KANTO_BOUNDS[0][1] - 50),
            L.latLng(KANTO_BOUNDS[1][0] + 50, KANTO_BOUNDS[1][1] + 50)
        ));

        mapRef.current = map;

        // Force resize after modal animation
        setTimeout(() => map.invalidateSize(), 150);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [focusLocation, encounterHighlights]);

    return (
        <div
            ref={mapContainerRef}
            style={{
                width: '100%',
                height,
                borderRadius: '4px',
                overflow: 'hidden'
            }}
        />
    );
}
