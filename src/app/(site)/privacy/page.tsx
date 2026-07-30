import type { Metadata } from "next"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return (
    <div className="container-page py-10 max-w-2xl">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
      <div className="mt-6 prose-editorial">
        <p>GuitarTribe ("we", "us") respects your privacy. This policy explains what data we collect and how we use it.</p>
        <h2>Data we collect</h2>
        <ul>
          <li><strong>Account data</strong> — name, email, profile image (via GitHub / Google OAuth).</li>
          <li><strong>Usage data</strong> — pages viewed, searches performed (anonymised, no personal identifiers).</li>
          <li><strong>User content</strong> — reviews and discussions you submit.</li>
        </ul>
        <h2>How we use it</h2>
        <ul>
          <li>To provide and improve the service.</li>
          <li>To display your username next to reviews you submit.</li>
          <li>We never sell your data to third parties.</li>
        </ul>
        <h2>Cookies</h2>
        <p>We use a single session cookie for authentication, and a preference cookie for dark/light mode. No tracking cookies.</p>
        <h2>Contact</h2>
        <p>Questions? Email privacy@guitartribe.io</p>
      </div>
    </div>
  )
}
