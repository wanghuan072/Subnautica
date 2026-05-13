/** Map Genie data barrel: single entry for components under `src/data/mapgenie/`. */
import markers from './markers.json'
import regionsGeo from './mapGenieRegions.json'
import regionLabelsGeo from './mapGenieRegionLabels.json'
import regionNav from './mapGenieRegionNav.json'
import markersAtlas from './markersAtlas2x.json'
import worldRasterConfig from './worldRasterConfig.json'

export const mapGenieDataset = {
  markers,
  regionsGeo,
  regionLabelsGeo,
  regionNav,
  markersAtlas,
  worldRasterConfig,
  markersAtlasPng: '/images/mapgenie/markers@2x.png',
  ui: {
    eyebrow: 'Map Genie · Subnautica',
    mapTitle: 'World map',
    tagline:
      'MapLibre + local tiles (default-v1 / caves-v1), biome polygons and pins. npm run extract:mapgenie · download:mapgenie-tiles.',
  },
}
