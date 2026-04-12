export const FEEDBACK_CATEGORIES = [
  'Positive Feedback',
  'Negative Feedback',
  'Complaint',
  'Suggestion',
  'Product Issue',
  'Service Issue',
] as const;

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number];

export const CAT_CONFIG: Record<FeedbackCategory, {
  icon: string;
  colorClass: string;
  bgClass: string;
  textClass: string;
}> = {
  'Positive Feedback': { icon: '😊', colorClass: 'bg-[hsl(var(--cat-positive))]', bgClass: 'bg-[hsl(var(--cat-positive-bg))]', textClass: 'text-[hsl(var(--cat-positive-text))]' },
  'Negative Feedback': { icon: '😞', colorClass: 'bg-[hsl(var(--cat-negative))]', bgClass: 'bg-[hsl(var(--cat-negative-bg))]', textClass: 'text-[hsl(var(--cat-negative-text))]' },
  'Complaint':         { icon: '⚠️', colorClass: 'bg-[hsl(var(--cat-complaint))]', bgClass: 'bg-[hsl(var(--cat-complaint-bg))]', textClass: 'text-[hsl(var(--cat-complaint-text))]' },
  'Suggestion':        { icon: '💡', colorClass: 'bg-[hsl(var(--cat-suggestion))]', bgClass: 'bg-[hsl(var(--cat-suggestion-bg))]', textClass: 'text-[hsl(var(--cat-suggestion-text))]' },
  'Product Issue':     { icon: '📦', colorClass: 'bg-[hsl(var(--cat-product))]', bgClass: 'bg-[hsl(var(--cat-product-bg))]', textClass: 'text-[hsl(var(--cat-product-text))]' },
  'Service Issue':     { icon: '🔧', colorClass: 'bg-[hsl(var(--cat-service))]', bgClass: 'bg-[hsl(var(--cat-service-bg))]', textClass: 'text-[hsl(var(--cat-service-text))]' },
};

export const ADMIN_EMAILS_BY_CATEGORY: Record<FeedbackCategory, readonly string[]> = {
  'Positive Feedback': ['positive.feedback.admin@feedops.in'],
  'Negative Feedback': ['negative.feedback.admin@feedops.in'],
  'Complaint': ['complaint.admin@feedops.in'],
  'Suggestion': ['suggestion.admin@feedops.in'],
  'Product Issue': ['product.issue.admin@feedops.in'],
  'Service Issue': ['service.issue.admin@feedops.in'],
};

export const PRODUCT_CATEGORIES = [
  { cat: 'Electronics', icon: '📱', bgClass: 'bg-accent' },
  { cat: 'Books', icon: '📚', bgClass: 'bg-[hsl(var(--cat-suggestion-bg))]' },
  { cat: 'Clothing & Jewelry', icon: '👗', bgClass: 'bg-[hsl(var(--cat-negative-bg))]' },
  { cat: 'Home & Kitchen', icon: '🏠', bgClass: 'bg-[hsl(var(--cat-positive-bg))]' },
  { cat: 'Sports & Outdoors', icon: '⚽', bgClass: 'bg-[hsl(var(--cat-positive-bg))]' },
  { cat: 'Beauty & Care', icon: '💄', bgClass: 'bg-[hsl(var(--cat-negative-bg))]' },
  { cat: 'Toys & Games', icon: '🧸', bgClass: 'bg-accent' },
  { cat: 'Grocery & Food', icon: '🛒', bgClass: 'bg-[hsl(var(--cat-positive-bg))]' },
  { cat: 'Health & Household', icon: '💊', bgClass: 'bg-[hsl(var(--cat-complaint-bg))]' },
  { cat: 'Automotive', icon: '🚗', bgClass: 'bg-muted' },
  { cat: 'Prime & Delivery', icon: '📦', bgClass: 'bg-accent' },
  { cat: 'Amazon Devices', icon: '🔵', bgClass: 'bg-[hsl(var(--cat-service-bg))]' },
  { cat: 'Amazon Pay', icon: '💳', bgClass: 'bg-[hsl(var(--cat-suggestion-bg))]' },
  { cat: 'Customer Service', icon: '🎧', bgClass: 'bg-[hsl(var(--cat-positive-bg))]' },
] as const;
