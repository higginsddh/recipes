let connectionId: string = "";

export function setConnectionId(input: string) {
  connectionId = input;
}

export function getConnectionId() {
  return connectionId;
}

type Path = `/${string}`;

export async function executePost(url: Path, data = {}) {
  return await fetch(url, {
    method: "POST",
    headers: {
      ...getSignalRConnectionIdHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function executePatch(url: Path, data = {}) {
  return await fetch(url, {
    method: "PATCH",
    headers: {
      ...getSignalRConnectionIdHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function executeDelete(path: Path, body = {}) {
  return await fetch(buildRoute(path), {
    method: "DELETE",
    headers: getSignalRConnectionIdHeader(),
    body: JSON.stringify(body),
  });
}

export async function executeGet(path: Path) {
  return await fetch(buildRoute(path), {
    headers: getSignalRConnectionIdHeader(),
  });
}

export function buildRoute(input: string) {
  if (window.location.origin === "http://localhost:3000") {
    return `http://localhost:7071${input}`;
  }

  return input;
}

function getSignalRConnectionIdHeader(): HeadersInit {
  return {
    SignalRConnectionId: connectionId,
  };
}
