let count = 0
let recentAccess: { accessed_at: string }[] = []

export async function incrementAndLog() {
  count += 1
  recentAccess.unshift({ accessed_at: new Date().toISOString() })
  if (recentAccess.length > 5) {
    recentAccess = recentAccess.slice(0, 5)
  }

  return {
    count,
    recentAccess
  }
}

export async function getStats() {
  return {
    count,
    recentAccess
  }
}
