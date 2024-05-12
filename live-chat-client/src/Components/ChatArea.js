import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import axios from "axios";
import { myContext } from "./MainContainer";

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  const [chat_id, chat_user] = dyParams._id.split("&");
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [allMessages, setAllMessages] = useState([]);
  const { refresh, setRefresh } = useContext(myContext);
  const [loaded, setLoaded] = useState(false);

  const fetchMessages = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    axios
      .get(`http://localhost:8080/message/${chat_id}`, config)
      .then(({ data }) => {
        setAllMessages(data);
        setLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  const sendMessage = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    axios
      .post(
        "http://localhost:8080/message/",
        {
          content: messageContent,
          chatId: chat_id,
        },
        config
      )
      .then(({ data }) => {
        console.log("Message sent successfully");
        // After sending message, fetch messages to update chat
        fetchMessages();
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  useEffect(() => {
    // Fetch messages initially
    fetchMessages();

    // Set up polling interval (fetch messages every 10 seconds)
    const intervalId = setInterval(fetchMessages, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [chat_id, userData.data.token]);

  return (
    <div className={"chatArea-container" + (lightTheme ? "" : " dark")}>
      <div className={"chatArea-header" + (lightTheme ? "" : " dark")}>
        <p className={"con-icon" + (lightTheme ? "" : " dark")}>
          {chat_user[0]}
        </p>
        <div className={"header-text" + (lightTheme ? "" : " dark")}>
          <p className={"con-title" + (lightTheme ? "" : " dark")}>
            {chat_user}
          </p>
        </div>
        <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
          <DeleteIcon />
        </IconButton>
      </div>
      <div className={"messages-container" + (lightTheme ? "" : " dark")}>
        {loaded ? (
          allMessages.slice(0).reverse().map((message, index) => {
            const sender = message.sender;
            const self_id = userData.data._id;
            return sender._id === self_id ? (
              <MessageSelf props={message} key={index} />
            ) : (
              <MessageOthers props={message} key={index} />
            );
          })
        ) : (
          // Display loading skeleton while messages are being fetched
          <div style={{ padding: "20px" }}>
            <Skeleton
              variant="rectangular"
              sx={{ width: "100%", borderRadius: "10px" }}
              height={60}
            />
            <Skeleton
              variant="rectangular"
              sx={{
                width: "100%",
                borderRadius: "10px",
                flexGrow: "1",
              }}
            />
            <Skeleton
              variant="rectangular"
              sx={{ width: "100%", borderRadius: "10px" }}
              height={60}
            />
          </div>
        )}
      </div>
      <div ref={messagesEndRef} className="BOTTOM" />
      <div className={"text-input-area" + (lightTheme ? "" : " dark")}>
        <input
          placeholder="Type a Message"
          className={"search-box" + (lightTheme ? "" : " dark")}
          value={messageContent}
          onChange={(e) => {
            setMessageContent(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.code === "Enter") {
              sendMessage();
              setMessageContent("");
            }
          }}
        />
        <IconButton
          className={"icon" + (lightTheme ? "" : " dark")}
          onClick={sendMessage}
        >
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default ChatArea;
