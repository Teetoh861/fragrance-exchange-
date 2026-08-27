export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <p className="mb-2 font-medium text-stone-700">Trust &amp; safety, plainly stated</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Listings are photo-reviewed by our team before going live — this is{" "}
            <strong>not physical authentication</strong>. Buy and swap with that in mind.
          </li>
          <li>
            We hold your payment until you confirm delivery, then release it to the seller. This is{" "}
            <strong>not licensed escrow</strong> and your funds are not protected by escrow law.
          </li>
          <li>Sellers must photograph the packaged item immediately before shipping.</li>
        </ul>
        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} Fragrance Exchange. All fragrances sold as-is; see each
          listing for condition details.
        </p>
      </div>
    </footer>
  );
}
