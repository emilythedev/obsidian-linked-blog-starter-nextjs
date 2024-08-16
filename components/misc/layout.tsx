import { ReactNode } from 'react';

type Props = {
  children: ReactNode,
  sidebar?: ReactNode,
};

const Layout = ({ children, sidebar }: Props) => {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto lg:max-w-none">
            <div className="lg:flex">
              <div className="lg:flex-1">
                {children}
              </div>
              { sidebar && (
                <>
                  <hr className="my-10 border border-dashed lg:block"/>
                  <aside className="relative lg:block lg:w-72 lg:ml-20 shrink-0">
                    {sidebar}
                  </aside>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout;
