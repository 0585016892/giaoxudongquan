import axiosClient from "./axios";

export const getGalleryImages = async () => {
  const response = await axiosClient.get("/gallery/images");
  return response;
};
