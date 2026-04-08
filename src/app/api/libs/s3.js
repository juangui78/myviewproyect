import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configura el cliente de S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const getUploadPresignedUrl = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: 'model/gltf-binary', // Especificar GLB para evitar problemas de descarga
    };
    try {
        const command = new PutObjectCommand(params);
        // Expirar URL en 3600 segundos (1 hora)
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return {
            success: true,
            uploadUrl: url,
            finalUrl: `${process.env.CLOUDFRONT_URL}/${key}`,
        };
    } catch (error) {
        console.error("Error generating presigned URL", error);
        return { success: false, message: 'Error generando URL de subida' };
    }
};

export const uploadFile = async (file, url) => {

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: url,
        Body: file,
        ACL: 'public-read',
    }

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return {
            message: "Archivo subido correctamente",
            success: true,
            url : `${process.env.CLOUDFRONT_URL}/${url}`

        };
    } catch (error) {
        return {
            message: "Error al subir archivo",
            success: false
        }
    }
}