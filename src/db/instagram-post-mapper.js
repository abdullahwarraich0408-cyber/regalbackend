export function rowToInstagramPost(row) {
  return {
    id: row.id,
    caption: row.caption ?? "",
    imageUrl: row.image_url ?? "",
    videoUrl: row.video_url ?? "",
    postUrl: row.post_url ?? "",
    shortcode: row.shortcode ?? "",
    likes: Number(row.likes ?? 0),
    isVideo: Boolean(row.is_video),
    isReel: Boolean(row.is_reel),
    published: Boolean(row.published),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}

export function inputToColumns(input) {
  return {
    caption: input.caption ?? "",
    image_url: input.imageUrl ?? "",
    video_url: input.videoUrl ?? "",
    post_url: input.postUrl ?? "",
    shortcode: input.shortcode ?? "",
    likes: input.likes ?? 0,
    is_video: input.isVideo ? 1 : 0,
    is_reel: input.isReel ? 1 : 0,
    published: input.published ? 1 : 0,
    sort_order: input.sortOrder ?? 0,
  };
}

/** Shape expected by the public website Instagram carousel */
export function toFeedPost(item) {
  const shortcode =
    item.shortcode || String(item.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12);
  const url = item.postUrl || `https://www.instagram.com/p/${shortcode}/`;

  return {
    id: item.id,
    shortcode,
    imageUrl: item.imageUrl,
    videoUrl: item.videoUrl || "",
    caption: item.caption,
    likes: item.likes ?? 0,
    url,
    isVideo: Boolean(item.isVideo),
    isReel: Boolean(item.isReel),
  };
}
