'use client'

import Link from 'next/link'
import { useState } from 'react'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'مدیریت مشتریان',
    desc: 'پروفایل کامل مشتریان، تاریخچه نوبت‌ها و ارتباط مستقیم با آن‌ها',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'نوبت‌دهی آنلاین',
    desc: 'مشتریان می‌توانند به راحتی نوبت رزرو کنند — ۲۴ ساعته، ۷ روز هفته',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'اپلیکیشن موبایل',
    desc: 'PWA کامل — مثل اپ نصب می‌شود، بدون نیاز به اپ‌استور',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'پیامک خودکار',
    desc: 'یادآوری نوبت به مشتری و اطلاع‌رسانی فوری به شما',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'مدیریت خدمات',
    desc: 'کاتالوگ کامل خدمات با قیمت و مدت زمان هر خدمت',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'برند اختصاصی',
    desc: 'رنگ، لوگو و تصویر کاور اختصاصی برای کسب‌وکار شما',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    title: 'تقویم فارسی',
    desc: 'همه تاریخ‌ها به تقویم شمسی — مناسب بازار ایران',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'نقشه و موقعیت',
    desc: 'نمایش آدرس دقیق روی OpenStreetMap برای راهنمایی مشتریان',
  },
]

const steps = [
  { num: '۱', title: 'ثبت‌نام کنید', desc: 'با شماره موبایل، بدون رمز عبور' },
  { num: '۲', title: 'پروفایل بسازید', desc: 'نام، لوگو، خدمات و ساعات کاری' },
  { num: '۳', title: 'مشتریان را دعوت کنید', desc: 'لینک یا QR کد اختصاصی' },
  { num: '۴', title: 'نوبت بگیرید', desc: 'مشتریان آنلاین رزرو می‌کنند' },
]

const plans = [
  {
    name: 'رایگان',
    price: '۰',
    period: 'یک ماه',
    features: ['۱ کسب‌وکار', 'مشتریان نامحدود', 'نوبت‌دهی آنلاین', 'پشتیبانی اولیه'],
    cta: 'شروع رایگان',
    highlight: false,
  },
  {
    name: 'حرفه‌ای',
    price: '۸۰,۰۰۰',
    period: 'ماهانه',
    features: ['همه امکانات رایگان', 'پیامک خودکار', 'برند اختصاصی', 'آمار پیشرفته', 'پشتیبانی ویژه'],
    cta: 'شروع با ۱ ماه رایگان',
    highlight: true,
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0FB9B1] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-[var(--foreground)]">Systemato</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">امکانات</a>
            <a href="#how" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">نحوه کار</a>
            <a href="#pricing" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">قیمت‌ها</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/signin" className="hidden sm:block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors font-medium">
              ورود
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-[#0FB9B1] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              شروع رایگان
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-[#0FB9B1]/10 text-[#0FB9B1] px-4 py-2 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-[#0FB9B1]" />
          مناسب آرایشگاه، کلینیک، تعمیرگاه و بیشتر
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--foreground)] leading-tight mb-6">
          مدیریت نوبت و مشتریان
          <br />
          <span className="text-[#0FB9B1]">کسب‌وکار شما</span>، بدون دردسر
        </h1>

        <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
          همه چیز برای مدیریت مشتری، رزرو آنلاین و رشد کسب‌وکار در یک پلتفرم ساده.
          بدون نصب اپ، بدون رمز عبور.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-[#0FB9B1] text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#0FB9B1]/25 hover:-translate-y-0.5"
          >
            شروع رایگان
            <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--foreground)] px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-[var(--muted)] transition-colors"
          >
            مشاهده امکانات
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { value: '+۱۰۰۰', label: 'رزرو ثبت‌شده' },
            { value: '+۵۰', label: 'کسب‌وکار فعال' },
            { value: '+۵۰۰', label: 'مشتری خوشحال' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-[var(--foreground)]">{stat.value}</div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[var(--card)] border-y border-[var(--border)] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">همه چیز که نیاز دارید</h2>
            <p className="text-[var(--muted-foreground)] mt-3 text-lg">ابزارهای حرفه‌ای برای مدیریت بهتر کسب‌وکار</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-[var(--background)] rounded-2xl p-5 border border-[var(--border)] hover:border-[#0FB9B1] hover:shadow-md transition-all duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-[#0FB9B1]/10 flex items-center justify-center text-[#0FB9B1] mb-4 group-hover:bg-[#0FB9B1] group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">چطور کار می‌کند؟</h2>
          <p className="text-[var(--muted-foreground)] mt-3 text-lg">در کمتر از ۵ دقیقه آماده استفاده‌اید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-[var(--border)]" style={{ left: '-50%', width: '150%' }} />
              )}
              <div className="relative text-center">
                <div className="w-16 h-16 bg-[#0FB9B1] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                  {step.num}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">{step.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[var(--card)] border-y border-[var(--border)] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">قیمت‌گذاری ساده</h2>
            <p className="text-[var(--muted-foreground)] mt-3 text-lg">بدون هزینه پنهان</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlight
                    ? 'bg-[#0FB9B1] border-[#0FB9B1] text-white'
                    : 'bg-[var(--background)] border-[var(--border)]'
                }`}
              >
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
                    محبوب‌ترین
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-[var(--foreground)]'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[var(--foreground)]'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-[var(--muted-foreground)]'}`}>
                      تومان / {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-white' : 'text-[#0FB9B1]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlight ? 'text-white' : 'text-[var(--foreground)]'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-white text-[#0FB9B1] hover:bg-white/90'
                      : 'bg-[#0FB9B1] text-white hover:opacity-90'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
          کسب‌وکار خود را دیجیتال کنید
        </h2>
        <p className="text-[var(--muted-foreground)] text-lg mb-8 max-w-xl mx-auto">
          به صدها کسب‌وکار ایرانی بپیوندید که با سیستماتو مشتریان و نوبت‌هایشان را مدیریت می‌کنند
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-[#0FB9B1] text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#0FB9B1]/25 hover:-translate-y-0.5"
        >
          همین الان شروع کنید — رایگان
          <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0FB9B1] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-[var(--foreground)]">Systemato</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            © ۱۴۰۳ سیستماتو — ساخته شده برای کسب‌وکارهای ایرانی
          </p>
          <div className="flex gap-6">
            <Link href="/signin" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">ورود</Link>
            <Link href="/signup" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">ثبت‌نام</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
