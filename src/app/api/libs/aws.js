import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "sa-east-1",
  credentials: {
    accessKeyId: "AKIA4DMVQV4N6YOMEOND",
    secretAccessKey: "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",
  },
});


export const uploadToS3 = async (bucket, key, fileContent, contentType) => {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });
  
    try {
      await s3.send(command); // Usamos send() para ejecutar el comando
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  };

  export const getS3File = async (bucket, key) => {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
  
    try {
      const { Body } = await s3.send(command); // 'Body' contiene el archivo
      return { Body }; // Retornamos solo el 'Body' del archivo
    } catch (error) {
      console.error("Error fetching file from S3:", error);
      throw error;
    }
  };

  export const deleteTempFile = async (bucket, key) => {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
  
    try {
      await s3.send(command); // Ejecutamos el comando para eliminar el archivo
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw error;
    }
  };