import * as signalR from "@microsoft/signalr";

let connection;

export const startSignalRConnection = (token, onNotificationReceived) => {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/hubs/notifications", {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

    connection.on("ReceiveNotification", onNotificationReceived);

    connection
        .start()
        .then(() => console.log("✅ SignalR подключён"))
        .catch((err) => console.error("❌ Ошибка подключения SignalR:", err));
};

export const stopSignalRConnection = () => {
    if (connection) {
        connection.stop();
    }
};
