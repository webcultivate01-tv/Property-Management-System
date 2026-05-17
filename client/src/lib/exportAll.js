// Fetches every row across a paginated list endpoint by walking pages.
// service.list(params) must return { data: [], meta: { totalPages, total } }.
//
// Usage:
//   const rows = await fetchAllPages(propertyService.list, { search, status });
export async function fetchAllPages(listFn, params = {}, perPage = 100) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  // Hard safety cap to avoid runaway loops.
  const MAX_PAGES = 200;
  while (page <= totalPages && page <= MAX_PAGES) {
    const res = await listFn({ ...params, page, limit: perPage });
    if (Array.isArray(res?.data)) all.push(...res.data);
    totalPages = res?.meta?.totalPages || 1;
    page += 1;
  }
  return all;
}
