export function buildRoute(input: string) {
  if (window.location.origin === "http://localhost:3000") {
    return `http://localhost:7071${input}`;
  }

  return input;
}
