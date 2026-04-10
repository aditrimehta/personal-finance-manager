export function invalidateDashboardCache() {
    localStorage.removeItem("dashboard_cache");
    localStorage.removeItem("dashboard_cache_time");
    localStorage.removeItem("categories_cache");
localStorage.removeItem("categories_cache_time");
}

export function invalidateProfileCache() {
    localStorage.removeItem("profile_cache");
    localStorage.removeItem("profile_cache_time");
    localStorage.removeItem("categories_cache");
localStorage.removeItem("categories_cache_time");
}

// Call this on logout to wipe everything
export function clearAllCache() {
    localStorage.removeItem("dashboard_cache");
    localStorage.removeItem("dashboard_cache_time");
    localStorage.removeItem("profile_cache");
    localStorage.removeItem("profile_cache_time");
    localStorage.removeItem("categories_cache");
localStorage.removeItem("categories_cache_time");
}