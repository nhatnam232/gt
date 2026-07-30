import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms of Service" }

export default function TermsPage() {
  return (
    <div className="container-page py-10 max-w-2xl">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
      <div className="mt-6 prose-editorial">
        <p>By using GuitarTribe you agree to these terms.</p>
        <h2>Use of the service</h2>
        <ul>
          <li>Don’t scrape, abuse, or overload our servers.</li>
          <li>Don’t submit false or misleading reviews.</li>
          <li>Don’t impersonate other users.</li>
        </ul>
        <h2>Content</h2>
        <p>Reviews and discussions you submit remain yours. By submitting you grant us a licence to display them on the site.</p>
        <h2>Affiliate links</h2>
        <p>Some links to retailers are affiliate links. We earn a small commission at no extra cost to you.</p>
        <h2>Disclaimer</h2>
        <p>Prices shown are approximate and may differ from the retailer’s current price. Always verify on the retailer’s site before purchasing.</p>
        <h2>Contact</h2>
        <p>legal@guitartribe.io</p>
      </div>
    </div>
  )
}
