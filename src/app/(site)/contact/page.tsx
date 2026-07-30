import type { Metadata } from "next"

export const metadata: Metadata = { title: "Contact" }

export default function ContactPage() {
  return (
    <div className="container-page py-10 max-w-xl">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-4 text-muted-foreground">We’d love to hear from you.</p>
      <dl className="mt-8 space-y-4">
        <div>
          <dt className="font-semibold">General enquiries</dt>
          <dd className="text-muted-foreground">hello@guitartribe.io</dd>
        </div>
        <div>
          <dt className="font-semibold">Press & partnerships</dt>
          <dd className="text-muted-foreground">press@guitartribe.io</dd>
        </div>
        <div>
          <dt className="font-semibold">Bug reports</dt>
          <dd className="text-muted-foreground">Open an issue on <a href="https://github.com/nhatnam232/gt/issues" className="underline">GitHub</a>.</dd>
        </div>
      </dl>
    </div>
  )
}
