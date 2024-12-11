"use client";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import "./globals.css";
// import { Input } from "@nextui-org/react";
import React from "react";
import Confetti from "react-confetti";
import {Input} from "@nextui-org/input";

export default function Home() {
  const [auth, setauth] = useState(false);
  const [user, setUser] = useState("");
  const [pickedName, setPickedName] = useState("");
  const [done, setDone] = useState(false);
  const [value, setValue] = useState("");
  const [secretKeys, setSecretKeys] = useState<string[][]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [time, setTime] = useState("");

  const checkSecretKey = (value: string) => {
    const res = secretKeys.find((val) => {
      if (val[1] === value) {
        setUser(val[0]);
        return true;
      }
    });
    console.log(res);
    console.log("HI");

    if (res) {
      setauth(true);
    } else {
      setauth(false);
    }
    return res;
  };

  const isInvalid = React.useMemo(() => {
    if (value === "") {
      setauth(false);
      return false;
    } 
    return checkSecretKey(value) ? false : true;
  }, [value]);

  function getTimeOfDayInTimezone() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 0 && hour < 12) {
      setTime("Morning");
    } else if (hour >= 12 && hour < 18) {
      setTime("Afternoon");
    } else {
      setTime("Evening");
    }
  }

  useEffect(() => {
    fetch("/api/getData")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        setSecretKeys(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });

    getTimeOfDayInTimezone();

    const isSecretSantaSet = localStorage.getItem("secretSanta") ? true : false;
    const user = localStorage.getItem("user") ? true : false;
    setDone(isSecretSantaSet);
    if (user) setUser(localStorage.getItem("user") ?? "");
    if (isSecretSantaSet)
      setPickedName(localStorage.getItem("secretSanta") ?? "");
  }, []);

  const getRandomNameAndDelete = async (auth: string) => {
    // Check if they alrdy got a name assigned
    const check = secretKeys.find((val) => {
      if (val[0] === auth) {
        if (val[2] !== "") {
          return true;
        }
      }
    });

    if (check) {
      //do smthign fro true
      localStorage.setItem("secretSanta", check[2]);
      setPickedName(check[2]);
    } else {
      // If they dont fetch a new name for them and assign it
      const response = await fetch("/api/pickSanta");
      if (!response.ok) {
        throw new Error("Failed to fetch names");
      }
      const data = await response.json();

      // Filter out the auth
      const filteredNames = data.filter((name: string) => name !== auth);
      if (filteredNames.length === 0) {
        console.error("No other names available!");
        return null;
      }
      // Pick a random name
      const randomIndex = Math.floor(Math.random() * filteredNames.length);
      const randomName = filteredNames[randomIndex];
      setPickedName(randomName);
      localStorage.setItem("secretSanta", randomName);

      // Remove the picked name
      // Send updated names back to the server

      const responseSend = await fetch("/api/pickSanta", {
        method: "POST", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
        body: JSON.stringify({
          arrayIndex: secretKeys.findIndex((val) => val[0] === auth),
          newName: randomName,
        }),
      });

      if (!responseSend.ok) {
        throw new Error("Failed to fetch names");
      }
    }

    setDone(true);
  };

  const handleClick = async () => {
    console.log("HI");
    localStorage.setItem("user", user);
    setShowConfetti(true);
    getRandomNameAndDelete(user);
    setTimeout(() => setShowConfetti(false), 5000);
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
            className={`transition-all duration-500 ${
              done
                ? "opacity-0 translate-y-5 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            <>
              <Input
                className="max-w-xs"
                errorMessage={"Enter Valid Secret Key"}
                isInvalid={isInvalid}
                label="Secret Key"
                type="password"
                variant="bordered"
                value={value}
                onValueChange={setValue}
              />
              <div
                className={`mt-4 transition-all duration-500 ${
                  auth
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-5"
                }`}
              >
                <Button
                  disabled={!auth}
                  color="primary"
                  onClick={handleClick}
                >
                  {"Find out your secret santa ->"}
                </Button>
              </div>
            </>
          </div>
          <div
            className={`transition-all duration-500 items-center ${
              !done
                ? "opacity-0 translate-y-5 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            <>{`Good ${time}, ${user}. Your secret santa is ${pickedName}`}</>

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
