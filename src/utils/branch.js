// Fixed branch identifiers, matching the organization's physical branches.
// These use stable ids (not Firestore auto-ids) so default heads and the
// legacy-data resolver below can reference them reliably.
export const BRANCH_SEED = [
  { id: 'headoffice', name: 'Head Office - Colombo' },
  { id: 'temple', name: 'Aishwarya Lakshmi Temple - Colombo' },
  { id: 'jaffna', name: 'Jaffna' },
  { id: 'kilinochchi', name: 'Kilinochchi Training Centre' },
]

// Pre-merge, the app used a separate "Fund" classification (temple / general /
// building / property) alongside a separate "Centre" selection. This maps old
// Fund ids to their closest matching Branch, for records saved before the merge.
const FUND_TO_BRANCH = {
  temple: 'temple',
  general: 'headoffice',
  building: 'jaffna',
  property: 'headoffice',
}

function matchByName(name) {
  if (!name) return null
  const n = name.toLowerCase()
  if (n.includes('temple')) return 'temple'
  if (n.includes('jaffna')) return 'jaffna'
  if (n.includes('kilinochchi')) return 'kilinochchi'
  if (n.includes('head office') || n.includes('colombo')) return 'headoffice'
  return null
}

// Resolves the effective branchId for any head or voucher, including ones
// saved before the Fund+Centre -> Branch merge (which had fundId/locationId
// instead of branchId). New records always set branchId directly.
export function resolveBranchId(entity) {
  if (!entity) return null
  if (entity.branchId) return entity.branchId
  if (entity.fundId && FUND_TO_BRANCH[entity.fundId]) return FUND_TO_BRANCH[entity.fundId]
  const byLocation = matchByName(entity.locationName)
  if (byLocation) return byLocation
  const byBranchName = matchByName(entity.branchName)
  if (byBranchName) return byBranchName
  return null
}

export function branchName(branches, branchId) {
  return branches.find((b) => b.id === branchId)?.name || 'Unclassified'
}

// Finds the opening-balance/opening-asset record for a branch, preferring an
// exact branchId match (post-merge records) over a legacy fundId/name-based
// fallback match (pre-merge records), so re-saving a value under the new
// Branch system always takes precedence over the old Fund-era figure.
export function findRecordForBranch(records, branchId) {
  const exact = records.find((r) => r.branchId === branchId)
  if (exact) return exact
  return records.find((r) => resolveBranchId(r) === branchId)
}
