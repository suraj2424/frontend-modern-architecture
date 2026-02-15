"use client";
import React, { useEffect, useRef, useState } from "react";

interface dataProps {
  id: number;
  author: string;
  content: string;
  likes: number;
  isLiked: boolean;
}

export default function TASK2() {
  const [data, setData] = useState<dataProps[]>([]);
  const confirmedDataRef = useRef<dataProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/posts");
        const json = await res.json();
        console.log(json);
        setData(json);
        confirmedDataRef.current = json;
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    fetchData();
  }, []);

  // non-optimistic approach
  // const handleLike = async (id: number) => {
  //   try {
  //     const res = await fetch("/api/posts/${id}/like", {
  //       method: "POST",
  //     });
  //     const json = await res.json();
  //     // Update data AFTER server responds
  //     setData((prev) =>
  //       prev.map((post) => (post.id === id ? json.post : post)),
  //     );
  //   } catch (error) {
  //     console.log("Error: ", error);
  //   }
  // };

  /** OPTIMISTIC APPROACH  */
  // const handleLike = async (id: number) => {

  //   const previousData = [...data];

  //   setData(prev => prev.map(post => {
  //     if(post.id === id) {
  //       return {
  //         ...post,
  //         isLiked: !post.isLiked,
  //         likes: post.likes + (post.isLiked ? -1 : 1),
  //       }
  //     }
  //     return post;
  //   }))

  //   try {
  //     const res = await fetch(`/api/posts/${id}/like`, {
  //       method: "POST",
  //     });

  //     if(!res.ok) {
  //       setData(previousData);
  //     }
  //   } catch (error) {
  //     console.log("Error: ", error);
  //     setData(previousData);
  //   }
  // };

  /** OPTIMISTIC APPROACH ADVANCED (FIXED RACE CONDITION)  */
  /**
   * RACE CONDITION when we consecutively tap (example: tap tap tap tap tap tap tap)
   * causing inconsistent data on UI
   *
   * 1. RACE CONDITION: Final state is wrong
   * 2. FLICKERING: UI jumps around as failed requests revert one by one
   *
   */

  const handleLike = async (id: number) => {

    setData(prev=> prev.map(post=>{
      if(post.id === id) {
        return {
          ...post,
          isLiked : !post.isLiked,
          likes: post.likes + (post.isLiked ? -1 : 1)
        }
      }
      return post;
    }))

    try {
      const res = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        setData(confirmedDataRef.current);
      } else {
        const json = await res.json();
        confirmedDataRef.current = confirmedDataRef.current.map((post) =>
          post.id === id ? json.post : post,
        );
      }
    } catch (e) {
      setData(confirmedDataRef.current);
      console.log("Error: ", e);
    }
  };

  const handleDelete = async (id: number) => {
    setData(prev => prev.filter(post => post.id !== id))
    try {
      const res = await fetch(`/api/posts/${id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if(!res.ok) {
        setData(confirmedDataRef.current);
        console.log(`post ${id} deletion failed`);
      }
      else {
        confirmedDataRef.current = confirmedDataRef.current.filter(post=>post.id !== id)
        console.log(`post ${id} deletion successful ✅`)
      }
    }
    catch(e) {  
      console.log("Error: ", e)
      setData(confirmedDataRef.current);
    }
  }

  return (
    <div className="w-screen h-screen p-10 bg-zinc-50 dark:bg-zinc-950">
      <div className="grid grid-cols-3 gap-4">
        {data &&
          data.length > 0 &&
          data.map((item) => {
            return (
              <div
                key={item?.id}
                className="relative p-2 bg-white dark:bg-black border border-zinc-400 dark:border-zinc-600 shadow-md"
              >
                <p className="font-bold text-black  bg-yellow-500 w-fit px-2 mb-1">
                  {item.author}
                </p>
                <p className="rounded opacity-80 text-sm font-medium text-zinc-600 dark:text-zinc-500">
                  {item.content}
                </p>
                <div className="w-full flex items-center justify-between mt-4">
                  <p className="text-pink-500 text-xs font-semibold">
                    {item.likes} Likes
                  </p>
                  <p
                    className="text-red-500"
                    onClick={() => handleLike(item.id)}
                  >
                    {item?.isLiked === false ? (
                      <NFilledHeart />
                    ) : (
                      <FilledHeart />
                    )}
                  </p>
                </div>
                <button 
                className="absolute right-1 top-1 p-1 border border-red-500 hover:bg-red-500 hover:text-white  transition-all duration-300"
                onClick={()=>handleDelete(item.id)}>
                  ⨉
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

const NFilledHeart: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.494 3.801c2.095 1.221 3.569 3.7 3.504 6.592c-.081 3.61-2.89 6.794-7.679 9.638c-.71.422-1.458.969-2.319.969c-.845 0-1.625-.557-2.32-.97c-4.787-2.843-7.597-6.028-7.678-9.637c-.065-2.892 1.409-5.37 3.504-6.592C7.466 2.66 9.928 2.653 12 4.338c2.072-1.685 4.534-1.679 6.494-.537M17.487 5.53c-1.394-.812-3.136-.783-4.644.743a1.19 1.19 0 0 1-1.686 0c-1.508-1.526-3.25-1.555-4.644-.743c-1.444.842-2.56 2.628-2.511 4.82c.056 2.511 2.04 5.194 6.7 7.962c.408.243.834.554 1.298.683c.464-.129.89-.44 1.298-.683c4.66-2.768 6.644-5.45 6.7-7.963c.05-2.19-1.067-3.977-2.511-4.819" />
  </svg>
);

const FilledHeart: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g fill="none">
      <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="currentColor"
        d="M18.494 3.801c2.095 1.221 3.569 3.7 3.504 6.592C21.86 16.5 13.5 21 12 21s-9.861-4.5-9.998-10.607c-.065-2.892 1.409-5.37 3.504-6.592C7.466 2.66 9.928 2.653 12 4.338c2.072-1.685 4.534-1.679 6.494-.537"
      />
    </g>
  </svg>
);
