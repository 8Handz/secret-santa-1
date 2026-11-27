"use client";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import "./globals.css";
// import { Input } from "@nextui-org/react";
import React from "react";
import Confetti from "react-confetti";
import { Input } from "@nextui-org/input";

export default function Home() {
  const [user, setUser] = useState("");
  const [pickedName, setPickedName] = useState("");
  const [done, setDone] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [time, setTime] = useState("");

  function getTimeOfDayInTimezone() {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 12) {
      setTime("Morning");
    } else if (hour >= 12 && hour < 18) {
      setTime("Afternoon");
    } else {
      setTime("Evening");
    }
  }

  useEffect(() => {
    getTimeOfDayInTimezone();

    const savedPick = localStorage.getItem("secretSanta");
    const savedUser = localStorage.getItem("user");
    if (savedPick) {
      setDone(true);
      setPickedName(savedPick);
      if (savedUser) setUser(savedUser);
    }
  }, []);

  // The key is verified and the name is picked on the server; we only
  // ever receive our own result.
  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: value }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(
          response.status === 401
            ? "Enter Valid Secret Key"
            : data.error ?? "Something went wrong"
        );
        return;
      }

      setUser(data.user);
      setPickedName(data.pickedName);
      localStorage.setItem("user", data.user);
      localStorage.setItem("secretSanta", data.pickedName);
      setDone(true);
      setTimeout(() => setShowConfetti(true), 1000);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200} // Number of confetti pieces
          recycle={false}
          gravity={0.5}
        />
      )}

      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen h-96 p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className=" dark flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
              done
                ? "opacity-0 translate-y-5 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            <>
              <Input
                className="max-w-xs"
                errorMessage={error}
                isInvalid={error !== ""}
                label="Secret Key"
                type="password"
                variant="bordered"
                value={value}
                onValueChange={(v) => {
                  setValue(v);
                  setError("");
                }}
              />
              <div
                className={`mt-4 transition-all duration-500 ${
                  value !== ""
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-5"
                }`}
              >
                <Button
                  isDisabled={value === "" || loading}
                  isLoading={loading}
                  color="primary"
                  onClick={handleClick}
                >
                  {"Find out your secret santa ->"}
                </Button>
              </div>
            </>
          </div>
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
              !done
                ? "opacity-0 translate-y-5 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center bg-gradient-to-b from-white to-black bg-clip-text text-transparent">
              <span className="block">{`Good ${time},`}</span>
              <span className="block">{`${user}.`}</span>
              <span className="block">{`Your secret santa is`}</span>
              <span className="block">{`${pickedName}`}</span>
            </h1>
          </div>
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Created
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Deployed
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            And Ultilized by Samuel →
          </a>
        </footer>
      </div>
    </>
  );
}
