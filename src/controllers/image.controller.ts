import { v2 as cloudinary } from 'cloudinary';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ALLOWED_IMAGE_TYPES } from '../constants/format';
import { STANDARD } from '../constants/request';
import { handleServerError } from '../helpers/errors.helper';
import { prisma } from '../utils';

export const uploadImage = async (
  content: Buffer,
  mimetype: string,
): Promise<{ url: string }> => {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      reject(
        new Error(
          `Invalid file type. Allowed types are: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        ),
      );
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'uploads',
        allowed_formats: ALLOWED_IMAGE_TYPES.map((type) => type.split('/')[1]),
        resource_type: 'auto',
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Upload failed: ${error.message}`));
        } else if (!result) {
          reject(new Error('No result from Cloudinary'));
        } else {
          resolve({ url: result.secure_url });
        }
      },
    );

    uploadStream.end(content);
  });
};

export const uploadMimetypeImage = async (
  request: FastifyRequest<{
    Querystring: { user_id: string };
  }>,
  reply: FastifyReply,
) => {
  try {
    console.log('[request]', request.query);
    const { user_id } = request.query;

    if (!user_id || typeof user_id !== 'string') {
      return reply.status(400).send({
        statusCode: 400,
        message: 'User ID is required and must be a string',
      });
    }

    // Convert user_id to a number
    const userId = Number(user_id);
    if (isNaN(userId)) {
      return reply.status(400).send({
        statusCode: 400,
        message: 'User ID must be a valid number',
      });
    }

    // Access the uploaded file
    const imageAsFile = await request.file();

    if (!imageAsFile) {
      return reply.status(400).send({
        statusCode: 400,
        message: 'No file uploaded',
        code: 'NO_FILE',
      });
    }

    const { mimetype, filename } = imageAsFile;

    // Check if the file type is allowed
    if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      return reply.status(400).send({
        statusCode: 400,
        message: 'Invalid file type',
        code: 'INVALID_TYPE',
      });
    }

    // Convert the file to a buffer
    const buffer = await imageAsFile.toBuffer();

    // Upload the image to Cloudinary
    const result = await uploadImage(buffer, mimetype);

    // Save the image to the database with the user_id
    const savedImage = await prisma.image.create({
      data: {
        url: result.url,
        originalName: filename,
        size: buffer.length,
        mimetype: mimetype,
        user_id: userId,
      },
    });

    // Return the response with the saved image details
    return reply.status(STANDARD.OK.statusCode).send({
      statusCode: STANDARD.OK.statusCode,
      data: {
        id: savedImage.id,
        url: savedImage.url,
        originalName: savedImage.originalName,
        size: savedImage.size,
        mimetype: savedImage.mimetype,
        created_at: savedImage.created_at,
      },
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const showUploadsAsList = async (
  request: FastifyRequest<{
    Querystring: { user_id: string };
  }>,
  reply: FastifyReply,
) => {
  try {
    const { user_id } = request.query;

    if (!user_id || typeof user_id !== 'string') {
      return reply.status(400).send({
        statusCode: 400,
        message: 'User ID is required and must be a string',
      });
    }

    const userId = Number(user_id);

    if (isNaN(userId)) {
      return reply.status(400).send({
        statusCode: 400,
        message: 'User ID must be a valid number',
      });
    }

    const images = await prisma.image.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        url: true,
        originalName: true,
        size: true,
        mimetype: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return reply.status(STANDARD.OK.statusCode).send({
      statusCode: STANDARD.OK.statusCode,
      data: images,
    });
  } catch (err) {
    console.error('Error in showUploadsAsList:', err); // Log the error for debugging
    return handleServerError(reply, err);
  }
};
