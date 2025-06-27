async function setTimer(durationInMillis: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, durationInMillis);
  });
}
