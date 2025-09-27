import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '../../../lib/cloudinary';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files uploaded' },
        { status: 400 }
      );
    }

    if (files.length > 4) {
      return NextResponse.json(
        { success: false, message: 'Maximum 4 images allowed' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (file.size === 0) continue;

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: 'Only JPEG, PNG, GIF and WebP images are allowed' },
          { status: 400 }
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'File size should not exceed 5MB' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const publicId = `matrix/products/${timestamp}_${originalName}`;
      
      const result = await uploadToCloudinary(buffer, { 
        public_id: publicId,
        folder: 'matrix/products'
      });

      uploadedFiles.push({
        url: result.secure_url,
        originalName: file.name,
        size: file.size,
        type: file.type,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully to Cloudinary',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files', error: error.message },
      { status: 500 }
    );
  }
}