import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  Landmark,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    title: "Find a 7/12 or 8A extract",
    detail: "Open Maharashtra Bhulekh to look up a Record of Rights, property card, or village form.",
    label: "MAHARASHTRA",
    href: "https://bhulekh.mahabhumi.gov.in/",
    icon: FileText,
  },
  {
    title: "Get a digitally signed 7/12",
    detail: "Continue to Maharashtra’s digital Satbara service for digitally signed records.",
    label: "MAHARASHTRA • DIGITAL SATBARA",
    href: "https://digitalsatbara.mahabhumi.gov.in/dslr",
    icon: ShieldCheck,
  },
  {
    title: "Find your state’s land portal",
    detail: "Land records are managed state by state. Use the national directory to find your state government site.",
    label: "ALL STATES & UNION TERRITORIES",
    href: "https://igod.gov.in/",
    icon: MapPin,
  },
  {
    title: "See national programme progress",
    detail: "Explore state-reported progress for land-record digitisation and cadastral maps.",
    label: "GOVERNMENT OF INDIA • DILRMP",
    href: "https://dilrmp.gov.in/",
    icon: Landmark,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f6f3] text-slate-900">
      <div className="border-b border-slate-200 bg-white px-4 py-2 text-center text-xs text-slate-600">
        Independent prototype. Not an official government website or service.
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="BhoomiSetu home">
            <Image src="/bhoomisetu-mark.svg" alt="" width={40} height={40} />
            <span>
              <span className="block text-base font-bold">BhoomiSetu</span>
              <span className="block text-xs text-slate-500">Land services directory</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <a href="#services" className="hidden text-slate-600 hover:text-slate-950 sm:inline">Services</a>
            <a href="#about" className="hidden text-slate-600 hover:text-slate-950 sm:inline">About this site</a>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-md bg-[#123b32] px-4 py-2.5 text-white hover:bg-[#1b5144]">
              Prototype workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-[linear-gradient(115deg,#f4f6f3_0%,#edf3ef_55%,#e5eee9_100%)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <div>
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-[#27624f]">
                <span className="h-px w-7 bg-[#27624f]" /> A starting point for land-record services
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Looking for your 7/12? Let&apos;s get you to the right place.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                “Satbara” can feel like a lot of paperwork. Start with the state that holds your record; we&apos;ll point you to its official portal.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://bhulekh.mahabhumi.gov.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#123b32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1b5144]">
                  Open Maharashtra Bhulekh <ExternalLink className="h-4 w-4" />
                </a>
                <a href="https://igod.gov.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  My record is in another state <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">You&apos;ll continue on a government website. BhoomiSetu doesn&apos;t ask for your land details or documents.</p>
            </div>

            <aside className="border-l-2 border-[#c47c28] bg-white/70 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-5 w-5 text-[#27624f]" /> A little prep can save a trip
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">For a Maharashtra search, it helps to have these details nearby:</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2"><span className="font-bold text-[#27624f]">01</span> District, taluka, and village</li>
                <li className="flex gap-2"><span className="font-bold text-[#27624f]">02</span> Survey number or Gat number</li>
                <li className="flex gap-2"><span className="font-bold text-[#27624f]">03</span> The record type you need: 7/12, 8A, or property card</li>
              </ul>
              <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">Each state portal is a little different. Some may ask you to complete a CAPTCHA or sign in.</p>
            </aside>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[#27624f]">Choose what you need</p>
              <h2 className="mt-2 text-2xl font-bold">Where would you like to go?</h2>
            </div>
            <span className="text-xs text-slate-500">These links open the official service in a new tab</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(({ title, detail, label, href, icon: Icon }) => (
              <a key={title} href={href} target="_blank" rel="noreferrer" className="group flex min-h-56 flex-col border border-slate-200 bg-white p-5 transition hover:border-[#8aab9b] hover:shadow-sm">
                <span className="flex items-center justify-between text-[10px] font-bold text-[#27624f]">
                  {label}<ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#27624f]" />
                </span>
                <Icon className="mt-5 h-5 w-5 text-[#27624f]" />
                <h3 className="mt-3 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
              </a>
            ))}
          </div>
        </section>

        <section id="about" className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-sm text-slate-600 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">About BhoomiSetu</h2>
              <p className="mt-1 max-w-2xl leading-6">BhoomiSetu is an independent prototype, not a government office. We don&apos;t store your personal land information; official records stay with the authority that maintains them.</p>
            </div>
            <Link href="/map" className="inline-flex shrink-0 items-center gap-2 font-semibold text-[#185442] hover:underline">
              View sample map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-4 text-center text-xs text-slate-500">
        BhoomiSetu is not affiliated with the Government of India or any state government.
      </footer>
    </div>
  );
}
