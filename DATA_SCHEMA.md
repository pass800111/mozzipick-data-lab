# MOZZIPICK DATA LAB — data schema v2

The public dashboard currently uses sample UI data. Verified research data should replace samples only after source validation.

## Product record
- id
- product_name_ko
- brand
- exact_model
- category
- release_date
- release_month
- discovered_at
- trend_score
- rank_current
- rank_previous
- rank_change
- status: new / rising / falling / stable

## Source verification
- coupang.status: exact / unverified / ended
- coupang.url
- instagram.status
- instagram.video_url
- tiktok.status
- tiktok.video_url
- tiktok.shop_url
- youtube.status
- youtube.video_url
- xiaohongshu.status
- xiaohongshu.search_term_zh
- xiaohongshu.video_url

## Video suitability
- people: none / hands_only / face_or_body
- resolution
- captions
- watermark
- product_demo
- shorts_fit
- hook_1_3s
- source_quality

## Content
- 2_1: hook / core / footage / direction
- 2_2: hook / core / footage / direction
- 2_3: hook / core / footage / direction

## Rank history
Store one record per product per observation time:
- product_id
- observed_at
- rank
- trend_score
- source_signal_summary


## MOZZIPICK grade policy
- S: registered/updated within the last 3 days.
- A: older than 3 days and within 15 days.
- B: older than 15 days.
- C/D are not used anywhere in the current site.
- The hourly product-update workflow must recalculate grade, viralGrade, coupangGroup and coupangMatchGrade with the same S/A/B rule.

## Link and image integrity
- Product action links render only when the value is a valid http/https URL.
- Descriptive source notes must not be treated as clickable URLs.
- Every product must have an image value; if an external image fails or is not the exact verified variant, use assets/products/image-fallback.svg.
- External image failures are caught by the global image fallback guard.
