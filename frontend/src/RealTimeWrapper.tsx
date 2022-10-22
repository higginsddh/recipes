import * as signalR from "@microsoft/signalr";
import React, { useEffect } from "react";
import { useQueryClient } from "react-query";
import { getConnectionId, setConnectionId } from "./services/httpUtilities";

const RealTimeWrapper: React.FunctionComponent<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  useSignalRSubscription();

  return <>{children}</>;
};

function useSignalRSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiBaseUrl = window.location.origin;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(apiBaseUrl + "/api")
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("shoppingListItemsChanged", (message) => {
      if (getConnectionId() !== message) {
        console.info("clearing cache since different connection");
        queryClient.invalidateQueries(["shoppingListItems"]);
      } else {
        console.info("same connection, not clearing cache");
      }
    });

    connection.onreconnected((connectionId) => {
      setConnectionId(connectionId ?? "");
    });

    connection
      .start()
      .catch(console.error)
      .then(() => {
        setConnectionId(connection.connectionId ?? "");
      });

    return function cleanup() {
      connection.stop();
    };
  }, []);
}

export default RealTimeWrapper;
