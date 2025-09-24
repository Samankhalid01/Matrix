import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

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

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: 'Only JPEG, PNG, and WebP images are allowed' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'File size should not exceed 5MB' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${originalName}`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, ignore error
      }

      // Write file
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      // Return the public URL path
      uploadedFiles.push({
        url: `/uploads/${fileName}`,
        originalName: file.name,
        size: file.size,
        type: file.type
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
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