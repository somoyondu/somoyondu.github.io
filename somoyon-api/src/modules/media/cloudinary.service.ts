import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export const CLOUDINARY_PRESETS = {
  avatar: 'c_fill,g_face,w_200,h_200,q_auto,f_auto,r_max',
  avatar_2x: 'c_fill,g_face,w_400,h_400,q_auto,f_auto,r_max',
  gallery_slide: 'c_fill,w_1000,h_1000,q_auto,f_auto',
  gallery_thumb: 'c_fill,w_400,h_400,q_auto,f_auto',
  cover: 'c_fill,w_1200,h_630,q_auto,f_auto',
  hero: 'c_fill,w_1920,h_1080,q_auto,f_auto',
  logo: 'w_400,q_auto,f_auto',
  blur: 'w_20,e_blur:200,q_1,f_auto',
} as const;

export type CloudinaryPreset = keyof typeof CLOUDINARY_PRESETS;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.config.get('cloudinary.cloudName'),
      api_key: this.config.get('cloudinary.apiKey'),
      api_secret: this.config.get('cloudinary.apiSecret'),
      secure: true,
    });
  }

  get rootFolder() {
    return this.config.get<string>('cloudinary.rootFolder') || 'somoyon';
  }

  /** Prefixes with the configured root folder and strips traversal attempts. */
  resolveFolder(folder?: string) {
    const clean = (folder || 'misc')
      .replace(/\.\./g, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9/_-]/g, '-');
    return clean.startsWith(this.rootFolder) ? clean : `${this.rootFolder}/${clean}`;
  }

  /**
   * Signed params for browser-side direct upload. The API secret never leaves
   * the server; the browser only receives a one-shot signature.
   */
  signUpload(params: { folder?: string; tags?: string[]; publicId?: string }) {
    const timestamp = Math.round(Date.now() / 1000);
    const toSign: Record<string, any> = {
      timestamp,
      folder: this.resolveFolder(params.folder),
    };
    if (params.tags?.length) toSign.tags = params.tags.join(',');
    if (params.publicId) toSign.public_id = params.publicId;

    const signature = cloudinary.utils.api_sign_request(
      toSign,
      this.config.get<string>('cloudinary.apiSecret'),
    );

    return {
      ...toSign,
      signature,
      apiKey: this.config.get<string>('cloudinary.apiKey'),
      cloudName: this.config.get<string>('cloudinary.cloudName'),
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.config.get('cloudinary.cloudName')}/image/upload`,
      maxBytes: MAX_BYTES,
      allowedFormats: ALLOWED_FORMATS,
    };
  }

  /**
   * Re-fetches the resource from Cloudinary so a client cannot register a
   * forged public_id or lie about size/format.
   */
  async verifyResource(publicId: string) {
    try {
      const res = await cloudinary.api.resource(publicId, { resource_type: 'image' });
      if (res.bytes > MAX_BYTES) {
        throw new BadRequestException(`File exceeds the ${MAX_BYTES / 1024 / 1024}MB limit`);
      }
      if (!ALLOWED_FORMATS.includes(String(res.format).toLowerCase())) {
        throw new BadRequestException(`Format ${res.format} is not allowed`);
      }
      return res;
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`Cloudinary resource '${publicId}' could not be verified`);
    }
  }

  async uploadFromPath(filePath: string, options: { folder?: string; publicId?: string; tags?: string[] }) {
    return cloudinary.uploader.upload(filePath, {
      folder: this.resolveFolder(options.folder),
      public_id: options.publicId,
      tags: options.tags,
      overwrite: false,
      resource_type: 'image',
      unique_filename: false,
      use_filename: true,
    }) as Promise<UploadApiResponse>;
  }

  async destroy(publicId: string) {
    try {
      return await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    } catch (err) {
      this.logger.warn(`Failed to destroy '${publicId}': ${(err as Error).message}`);
      return { result: 'error' };
    }
  }

  async listAllPublicIds(prefix?: string): Promise<string[]> {
    const ids: string[] = [];
    let cursor: string | undefined;
    do {
      const res: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: prefix ?? this.rootFolder,
        max_results: 500,
        next_cursor: cursor,
      });
      ids.push(...res.resources.map((r: any) => r.public_id));
      cursor = res.next_cursor;
    } while (cursor);
    return ids;
  }

  /** Builds a transformed delivery URL for a stored public id. */
  buildUrl(publicId: string, preset: CloudinaryPreset = 'gallery_thumb') {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [{ raw_transformation: CLOUDINARY_PRESETS[preset] }],
    });
  }
}
