import Link from 'next/link';

function ArrowLeftIcon() {
  return (
    <svg className="admin__site-link-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 12H5M5 12l6 6M5 12l6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminBackToSiteLink() {
  return (
    <Link href="/" className="admin__site-link">
      <ArrowLeftIcon />
      <span>Back to Site</span>
    </Link>
  );
}
