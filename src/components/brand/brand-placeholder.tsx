import { brand } from "@/src/config/brand";

export function BrandPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`brand-placeholder ${className}`} role="img" aria-label={label}>
      <svg className="brand-placeholder-meander" viewBox="0 0 168 42" fill="none" aria-hidden="true">
        <path d="M1 41V1h40v20H21V1h40v40h20V21H61v20h40V1h20v20h-20v20h40V1h26" />
      </svg>
      <span className="brand-placeholder-monogram" aria-hidden="true">{brand.monogram}</span>
      <span className="brand-placeholder-caption">{brand.collectionLabel}</span>
    </div>
  );
}