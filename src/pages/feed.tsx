import NotificationCard from "../components/NotificationCard";
import {useEffect, useRef, useState} from "react";
import {Button, Text, useToasts} from "@geist-ui/react";
import useArConnect from "use-arconnect";
import {feed, subscribe} from "message-choice";
import CreateNotificationInput from "../components/CreateNotificationInput";

const arConnectPermissions = [
  "ACCESS_ADDRESS",
  "ACCESS_ALL_ADDRESSES",
  "SIGN_TRANSACTION",
];


const Feed = () => {

  const createNotificationModalRef = useRef();

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
      loadNotificationFeed(addr)
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

  const loadNotificationFeed = async (address) => {
    const f = []
    const full = await feed(address)
    console.log(full)
    for (let item of full) {
      try {
        item.data = JSON.parse(item.data)
        f.push(item)
      } catch (e) {

      }
    }
    setMyFeed(f);
  }

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
            <NotificationCard props={f} />
          )
        })
      }
      <Button
        type="success-light"
        // @ts-ignore
        onClick={() => createNotificationModalRef.current.open()}
      >
        Create Notification
      </Button>
      <CreateNotificationInput ref={createNotificationModalRef}/>
    </>
  )

}

export default Feed