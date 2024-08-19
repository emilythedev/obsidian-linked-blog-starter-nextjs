"use client";

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import Search from './search';

const Header = () => {
  const [top, setTop] = useState(true);
  // detect whether user has scrolled the page down by 10px
  useEffect(() => {
    const scrollHandler = () => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true)
    };
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [top]);

  return (
    <header className={`fixed w-full z-30 md:bg-white/90 transition duration-300 ease-in-out ${!top && 'bg-white backdrop-blur-sm shadow-lg'}`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <h2 className="shrink-0 mr-4 text-2xl font-bold tracking-tight">
            <Link href="/" className="block hover:underline" aria-label="My Blog">
              My Blog.
            </Link>
          </h2>
          <ul className="flex grow justify-end flex-wrap items-center">
            <li>
              <Suspense>
                <Search />
              </Suspense>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header
