import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center overflow-auto">
      <div className="h-full w-full  flex-col   border-x border-slate-400 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
