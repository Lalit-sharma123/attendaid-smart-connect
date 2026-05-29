export function captureVideoFrame(video: HTMLVideoElement, quality = 0.75) {
  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}

export async function startUserCamera(video: HTMLVideoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: "user",
    },
    audio: false,
  });

  video.srcObject = stream;
  await video.play();

  return stream;
}

export function stopUserCamera(stream?: MediaStream | null) {
  if (!stream) return;

  stream.getTracks().forEach((track) => track.stop());
}
