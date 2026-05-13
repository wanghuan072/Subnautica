import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.join(LIB_DIR, '..', '..')

export const SUBNAUTICA_DATA_DIR = path.join(REPO_ROOT, 'src/data/subnautica')
export const SUBNAUTICA_MARKERS_JSON = path.join(SUBNAUTICA_DATA_DIR, 'markers.json')
export const SUBNAUTICA_VANILLA_JSON = path.join(SUBNAUTICA_DATA_DIR, 'subnauticamap-vanilla.json')
