"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { searchPosts, SearchResult } from '../../actions';
import PostPreview from "../blog/post-preview";


function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event)
      }
    }
    // Bind the event listener
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [ref]);
}

function useKeyboardControl(
  inputRef: RefObject<HTMLInputElement>, visibleKey: string, hiddenKey = 'Escape'
) : [ boolean, Dispatch<SetStateAction<boolean>> ] {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      inputRef.current?.focus();
    }
  }, [visible])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        setVisible(true);
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setVisible(false);
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    }
  }, [])

  return [visible, setVisible];
}

function Search() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useKeyboardControl(inputRef, '/');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  useOutsideAlerter(containerRef, (e: MouseEvent) => {
    setVisible(false);
    e.stopPropagation();
  });

  useEffect(() => {
    setVisible(false);
  }, [pathname, searchParams])

  async function handleChangeInput(e) {
    setSearchResults(await searchPosts(e.target.value));
  }

  return (
    <>
      {/* Button */}
      <button className="w-4 h-4 my-auto mx-2 border-black" aria-label="Search" onClick={() => setVisible(true)} disabled={visible}>
        <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
        </svg>
      </button>

      {/* Overlay */}
      <div className={`fixed top-0 h-screen pt-16 pb-16 z-20 left-0 w-full overflow-y-auto overscroll-none overflow-x-hidden bg-white/95 ${visible ? "block" : "hidden"}`}>
        <div ref={containerRef} className="max-w-4xl mx-auto flex flex-wrap mt-5 px-5">

          {/* Search Bar */}
          <div className="w-full mb-16">
            <label className="block text-sm sr-only" htmlFor="search">Search</label>
            <div className="relative flex items-center">
              <input ref={inputRef} id="search" type="search" className="form-input w-full text-gray-800 px-3 py-2 pl-10" placeholder="Search my notes" onChange={handleChangeInput}/>
              <span aria-hidden className="absolute inline-block inset-0 right-auto flex items-center">
                <svg className="w-4 h-4 fill-current text-gray-400 mx-3 shrink-0" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.map((post) => (
            <PostPreview
              key={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              slug={post.slug}
              date={post.date}
              author={post.author}
            />
          ))}
        </div>
      </div>

    </>
  )
}

export default Search
