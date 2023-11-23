//이미지 리사이징 라이브러리
const sharp = require("sharp");

const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

//함수가 aws 람다에서 돌아가기 때문에 스크릿키랑 아이디를 자동으로 넣어준다 = > 아무것도 넣어줄 필요 x
const s3 = new S3Client();

//람다는 3개의 매개변수를 제공해서 이 함수를 호출해준다.
exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(event.Records[0].s3.object.key); //original/리버풀.png
  const filename = Key.split("/").at(-1);
  const ext = Key.split(".").at(-1).toLowerCase();
  const requiredFormat = ext === "jpg" ? "jpeg" : ext;
  console.log("name", filename, "ext", ext);
  try {
    const s3Object = await s3.send(new GetObjectCommand({ Bucket, Key }));
    const buffers = [];
    for await (const data of getObject.Body) {
      buffers.push(data);
    }
    const imageBuffer = Buffer.concat(buffers);

    console.log("original", s3Object);
    const resizedImage = await sharp(imageBuffer)
      .resize(200, 200, { fit: "inside" })
      .toFormat(requiredFormat)
      .toBuffer();
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: `thumb/${filename}`,
        Body: resizedImage,
      })
    );

    console.log("put", resizedImage.length);
    return callback(null, `thumb/${filename}`);
  } catch (error) {
    console.error(error);
    return callback(error);
  }
};
