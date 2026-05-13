/** Map Genie · Subnautica: Below Zero (separate data from Subnautica 1) */
import markers from './markers.json'
import regionsGeo from './mapGenieRegions.json'
import regionLabelsGeo from './mapGenieRegionLabels.json'
import regionNav from './mapGenieRegionNav.json'
import markersAtlas from './markersAtlas2x.json'
import regionStylesById from './mapGenieRegionStylesById.json'
import worldRasterConfig from './worldRasterConfig.json'

export const belowZeroMapGenieDataset = {
  markers,
  regionsGeo,
  regionLabelsGeo,
  regionNav,
  markersAtlas,
  regionStylesById,
  worldRasterConfig,
  markersAtlasPng: '/images/mapgenie-bz/markers@2x.png',
  ui: {
    eyebrow: 'Map Genie · Below Zero',
    mapTitle: '4546B world map',
    tagline:
      'MapLibre + Map Genie tiles/data. Pin photos: npm run download:mapgenie-bz-media (writes public/images/mapgenie-bz/media). Offline tiles: npm run download:mapgenie-bz-tiles then tilesBaseUrl.',
  },
}
