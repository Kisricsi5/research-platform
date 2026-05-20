export function getPagination(page?: string, limit?: string) {
  const take = Math.min(parseInt(limit || '12', 10), 100);
  const pageNum = Math.max(parseInt(page || '1', 10), 1);
  const skip = (pageNum - 1) * take;
  return { take, skip, page: pageNum };
}

export function buildPaginationMeta(total: number, page: number, take: number) {
  return {
    total,
    page,
    limit: take,
    totalPages: Math.ceil(total / take),
    hasNextPage: page * take < total,
    hasPrevPage: page > 1,
  };
}
