"use client";

import React from 'react'
import Container from "./Container";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

const FooterLinks = [
  { id: 1, title: "Главная", url: "/" },
  { id: 2, title: "Продукты", url: "/product" },
  { id: 3, title: "О бренде", url: "/about-us" },
  { id: 4, title: "Блог", url: "/blog" },
  { id: 5, title: "Контакты", url: "/contact" },
];

const SocialLinks = [
  { id: 1, title: "Facebook", url: "https://www.facebook.com/NUTVAC0MPLEX" },
  { id: 2, title: "Instagram", url: "https://www.instagram.com/nutva.uz" },
  { id: 3, title: "Twitter", url: "https://x.com/Nutva_uz" },
  { id: 4, title: "Telegram", url: "https://t.me/nutva_uz" },
  { id: 5, title: "Youtube", url: "https://www.youtube.com/@NutvaUz" },
];

const FooterLink = ({ title, url, className }: { title: string; url: string; className?: string }) => {
  return (
    <li className="mb-0 py-2">
      <Link
        href={url}
        className={clsx(
          "transition-all delay-75 pb-1 border-b-transparent border-b-2 hover:border-b-white",
          className
        )}
      >
        {title}
      </Link>
    </li>
  );
};

const PhoneLink = ({ title, url, className }: { title: string; url: string; className?: string }) => {
  return (
    <li className="mb-0 py-1 list-disc ml-3">
      <Link
        href={url}
        className={clsx(
          "transition-all delay-75 pb-1 border-b-transparent border-b-2 hover:border-b-white",
          className
        )}
      >
        {title}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#2B2B2B] text-white pt-16 pb-10">
      <Container className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        <div>
          <Image
            src="/nutva-logo.png"
            alt="logo"
            width={200}
            height={50}
            className="mb-6"
          />
          <p className="text-sm leading-relaxed text-white/80">
            NUTVA Complex — это натуральный и экологически чистый продукт высокого качества, созданный из трав Средней Азии и Европы по рецептам народной медицины.
          </p>
        </div>

        {/* CONTACTS */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Контакты</h4>
          <ul className="text-sm space-y-3 text-white/80">

            <li>
              <span className="block font-medium text-white">Колл-центр:</span>
              <ul className="ml-4 space-y-1">
                <PhoneLink title="1294" url="tel:1294" />
                <PhoneLink title="+998 71 211-11-12" url="tel:+998712111112" />
              </ul>
            </li>

            <li>
              <span className="block font-medium text-white">Эл. адрес:</span>
              <Link href="mailto:info@nutva.uz" className="ml-4 underline">
                info@nutva.uz
              </Link>
            </li>

            <li>
              <span className="block font-medium text-white">Адрес:</span>
              <span className="ml-4">Узбекистан, Ташкент</span>
            </li>

            <li>
              <span className="block font-medium text-white">По вопросам сотрудничества:</span>
              <ul className="ml-4 space-y-1">
                <PhoneLink title="+998 95 185-10-01" url="tel:+998951851001" />
                <PhoneLink title="info@nutva.uz" url="mailto:info@nutva.uz" />
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4">Быстрые ссылки</h4>
          <ul className="space-y-3 text-sm text-white/80">
            {FooterLinks.map((link) => (
              <FooterLink key={link.title} title={link.title} url={link.url} />
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4">Социальные сети</h4>
          <ul className="space-y-3 text-sm text-white/80">
            {SocialLinks.map((link) => (
              <FooterLink key={link.title} title={link.title} url={link.url} />
            ))}
          </ul>
        </div>

      </Container>
    </footer>
  )
}

export default Footer;