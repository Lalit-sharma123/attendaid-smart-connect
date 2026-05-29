import { apiRequest } from "@/lib/api";

export type FaceAnalyzeResponse = {
  face_detected: boolean;
  message?: string;
  bbox?: number[];
  landmarks?: number[][];
  det_score?: number;
  embedding?: number[];
  embedding_dim?: number;
  model_name?: string;
  model_version?: string;
};

export async function analyzeFaceApi(imageBase64: string): Promise<FaceAnalyzeResponse> {
  return apiRequest("/ai/face/analyze", {
    method: "POST",
    body: JSON.stringify({
      image_base64: imageBase64,
    }),
  });
}
