import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface FooterProps {
  primaryColor: string;
}

export default function Footer({ primaryColor }: FooterProps) {
  const { setting } = usePage<SharedData>().props;
  const logo = setting?.logo;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">

      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/" className="flex items-center">
                {logo ? (
                  <img
                    src={`/storage/${logo}`}
                    alt="Logo SPMI"
                    className="h-16 w-auto object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-300 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                )}
              </Link>

              <div>
                <h3 className="text-2xl font-bold">SPMI ASAINDO</h3>
                <p className="text-gray-400">Universitas Asa Indonesia</p>
              </div>
            </div>

            <p className="text-gray-400 max-w-md text-lg leading-relaxed">
              Sistem Penjaminan Mutu Internal terdepan untuk mewujudkan pendidikan tinggi
              yang berkualitas, berkelanjutan, dan berdaya saing global.
            </p>

            <div className="mt-8">
              <p className="text-gray-400 text-sm">
                © {currentYear} SPMI Universitas Asa Indonesia. All rights reserved.
              </p>
            </div>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Tautan Cepat</h4>
            <ul className="space-y-3">
              {['Beranda', 'Tentang', 'Dokumen', 'Kontak'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase() === 'beranda' ? '' : item.toLowerCase()}`}
                    className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Kontak Kami</h4>
            <div className="space-y-3 text-gray-400">

              <p className="flex items-center space-x-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Jl. Contoh Alamat No. 123, Jakarta</span>
              </p>

              <p className="flex items-center space-x-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:spmi@asaindo.ac.id" className="hover:text-red-500 transition-colors">
                  spmi@asaindo.ac.id
                </a>
              </p>

              <p className="flex items-center space-x-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(021) 1234-5678</span>
              </p>

            </div>
          </div>

          {/* Link Asaindo */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Link Asaindo</h4>

            <div className="space-y-4 text-gray-400">

              <a
                href="https://asaindo.ac.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-red-500 transition"
              >
                <span>Website</span>
              </a>

              <a
                href="https://siakad.asaindo.ac.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-red-500 transition"
              >
                <span>Siakad Asaindo</span>
              </a>

              <a
                href="https://lsp.asaindo.ac.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-red-500 transition"
              >
                <span>LSP Asaindo</span>
              </a>

            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
