import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading.component";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout.component";
import { PostView } from "~/components/postview.component";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  //change input to react hook form to avoid rerenders on every keypress

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("failed to post! try again later");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3 ">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        className="h-14 w-14  rounded-full"
        width={56}
        height={56}
        placeholder="blur"
        blurDataURL={user.profileImageUrl}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>POST</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col ">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  //start fetching asap cause with reactQuery if the fetching is the same it only fetches once and uses cashed data for next use
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
