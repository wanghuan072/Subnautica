import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.join(LIB_DIR, '..', '..')

/** Map Genie static data dir (matches extractor output paths) */
export const MAPGENIE_DATA_DIR = path.join(REPO_ROOT, 'src/data/mapgenie')
export const MAPGENIE_MARKERS_JSON = path.join(MAPGENIE_DATA_DIR, 'markers.json')

export const MAPGENIE_BZ_DATA_DIR = path.join(REPO_ROOT, 'src/data/mapgenie-bz')
export const MAPGENIE_BZ_MARKERS_JSON = path.join(MAPGENIE_BZ_DATA_DIR, 'markers.json')

export const MAPGENIE_SN2_DATA_DIR = path.join(REPO_ROOT, 'src/data/mapgenie-sn2')
export const MAPGENIE_SN2_MARKERS_JSON = path.join(MAPGENIE_SN2_DATA_DIR, 'markers.json')
