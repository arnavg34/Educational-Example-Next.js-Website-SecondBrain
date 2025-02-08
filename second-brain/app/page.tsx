"use client"

import { useState } from "react";



export default function Home() {
  const [count, setCount] = useState(0);

  const incrementCount = () => {
    setCount(count + 1);
  };
  return (
    <div className="h-screen flex justify-center items-center">
      
      <button className="bg-red-700 size-20 rounded-md" onClick={incrementCount}>
        
        <p className="text-lg">Click me:{count}</p>
        
      </button>
      
    </div>
  );
}
