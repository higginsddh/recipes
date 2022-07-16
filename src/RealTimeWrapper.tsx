import * as signalR from "@microsoft/signalr";
import React, { useEffect } from "react";
import { useQueryClient } from "react-query";

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

    connection.on("shoppingListItemsChanged", () => {
      console.log("test");
      queryClient.invalidateQueries(["shoppingListItems"]);
    });

    connection.start().catch(console.error);

    return function cleanup() {
      connection.stop();
    };
  }, []);
}

export default RealTimeWrapper;
