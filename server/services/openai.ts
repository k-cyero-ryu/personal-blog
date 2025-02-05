
import sharp from 'sharp';

export async function analyzePhoto(base64Image: string): Promise<{
  description: string;
  suggestedTags: string[];
}> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
    
    // Get image metadata using sharp
    const metadata = await sharp(buffer).metadata();
    
    // Basic image analysis based on metadata
    const description = `An image with dimensions ${metadata.width}x${metadata.height}`;
    
    // Generate basic tags based on image properties
    const suggestedTags = [
      metadata.format?.toLowerCase() || 'image',
      metadata.width && metadata.height ? 
        (metadata.width > metadata.height ? 'landscape' : 'portrait') : 'photo',
      metadata.hasAlpha ? 'transparent' : 'opaque'
    ];

    return {
      description,
      suggestedTags: suggestedTags.filter(Boolean)
    };
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return {
      description: "An uploaded image",
      suggestedTags: ["photo"]
    };
  }
}
