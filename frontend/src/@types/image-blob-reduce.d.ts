declare module "image-blob-reduce" {
  class ImageBlobReduce {
    toBlob(blob: Blob, options: { max: number }): Promise<Blob>;
  }

  export default ImageBlobReduce;
}
