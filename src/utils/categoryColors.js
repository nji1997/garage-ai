// Single source of truth for category → CSS class suffix mapping.
// Both share and demo pages import getCategoryClass so adding or renaming
// a category only requires one edit here.
const CATEGORY_CLASS_MAP = {
  Maintenance: 'catMaintenance',
  Upgrade: 'catUpgrade',
  Insurance: 'catInsurance',
  Repair: 'catRepair',
}

export function getCategoryClass(category) {
  return CATEGORY_CLASS_MAP[category] ?? 'catMaintenance'
}
