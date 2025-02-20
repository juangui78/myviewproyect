// import { S3Client, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// const S3Client_ = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// })

// export const putObject = async (idProject, idModel, fileType) => {

//   try {

//       //structure  idPRojec/idModel/ => model/scene.gltf
//                                             //scene.bin
//                                             //textures
//                                   //=> files/ writes.pdf
//                                           // etc 

//       const key = `${idProject}/${idModel}/model`;

//       const command = new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         key: key,
//         ContentType: fileType
//       })

//       const response = await S3Client_.send(command);
//       return response;


//   } catch (error) {
//     console.log(error)
//   }

// }