import sharp from 'sharp';

export default defineEventHandler(async (event) => {
  await isUserAuthenticated(event);
  const { url } = await readBody(event);
  
  if (!url) {
    throw createError({
      statusCode: 400,
      message: "URL is required"
    });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const imageBuffer = await response.arrayBuffer();

    const jpegBuffer = await sharp(Buffer.from(imageBuffer))
      .jpeg({
        quality: 95,
        mozjpeg: true
      })
      .toBuffer();

    // Convert buffer to base64
    const base64Image = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
    
    return base64Image;
  } catch (error) {
    console.error('Error processing image:', error);
    throw createError({
      statusCode: 500,
      message: "Failed to process image"
    });
  }
});