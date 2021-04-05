import NotificationCard from "../components/NotificationCard";
import {useEffect, useState} from "react";
import {Button, Text, useToasts} from "@geist-ui/react";
import useArConnect from "use-arconnect";
import {feed, subscribe} from "message-choice";

const arConnectPermissions = [
  "ACCESS_ADDRESS",
  "ACCESS_ALL_ADDRESSES",
  "SIGN_TRANSACTION",
];


const Feed = () => {

  const [addr, setAddr] = useState("");
  const [myFeed, setMyFeed] = useState([]);
  const [, setToast] = useToasts();

  const arConnect = useArConnect();

  useEffect(() => {
    if (!arConnect) return;
    (async () => {
      try {
        if ((await arConnect.getPermissions()).includes("ACCESS_ADDRESS")) {
          setAddr(await arConnect.getActiveAddress());
        }
      } catch {
      }
    })();
  }, [arConnect]);

  useEffect(() => {
    if (!addr) return;
    else {
      feed("s-hGrOFm1YysWGC3wXkNaFVpyrjdinVpRKiVnhbo2so").then(f => {
        console.log(f)
          setMyFeed(f)
        }
      )
    }

  }, [addr])

  const connectWallet = async () => {
    if (!arConnect) return window.open("https://arconnect.io");
    // logout
    if (addr !== "") {
      await arConnect.disconnect();
      setAddr("");
    } else {
      // login
      try {
        await arConnect.connect(arConnectPermissions);
        setAddr(await arConnect.getActiveAddress());
        window.addEventListener("walletSwitch", (e: any) =>
          setAddr(e.detail.address)
        );
      } catch {
        setToast({text: "Could not connect to ArConnect", type: "error"});
      }
    }
  };


  return (
    <>
      <Text onClick={connectWallet} style={{cursor: "pointer"}}>
        {(arConnect && (addr === "" ? "Log In" : "Logout")) ||
        "Install ArConnect"}
      </Text>
      <Text>{addr}</Text>
      <Button onClick={async () => {
        const txId = await subscribe("s-hGrOFm1YysWGC3wXkNaFVpyrjdinVpRKiVnhbo2so")
        console.log(txId)
      }}>Subscribe</Button>
      {
        myFeed.map((f) => {
          return (
            <NotificationCard/>
          )
        })
      }
    </>
  )

}

export default Feed