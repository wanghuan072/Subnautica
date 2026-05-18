/** Map Genie · Subnautica 2 (separate data from SN1 / Below Zero) */
import markers from './markers.json'
import mapGenieGroups from './mapGenieGroups.json'
import regionsGeo from './mapGenieRegions.json'
import regionLabelsGeo from './mapGenieRegionLabels.json'
import regionNav from './mapGenieRegionNav.json'
import markersAtlas from './markersAtlas2x.json'
import regionStylesById from './mapGenieRegionStylesById.json'
import worldRasterConfig from './worldRasterConfig.json'

export const subnautica2MapGenieDataset = {
  /** 使用 `src/data/mapIcon.js` 自绘 SVG 标点（与官网分组一一对应），不加载 markers@2x.png 切片 */
  useCustomMapIcons: true,
  markers,
  mapGenieGroups,
  regionsGeo,
  regionLabelsGeo,
  regionNav,
  markersAtlas,
  regionStylesById,
  worldRasterConfig,
  markersAtlasPng: '/images/mapgenie-sn2/markers@2x.png',
  ui: {
    eyebrow: 'Map Genie · Subnautica 2',
    mapTitle: 'World map',
    tagline:
      'MapLibre + Map Genie tiles/data. Pin photos: npm run download:mapgenie-sn2-media. Re-sync: npm run extract:mapgenie:sn2.',
  },
}
