import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import { PayloadClientConfig } from './types/payload-client-config';
import { S3Pointer } from './types/s3-pointer';
import { StoreCommandInput } from './types/store-command-input';

export class PayloadClient {
    private readonly client: S3Client;
    private readonly config: PayloadClientConfig;

    public constructor(config: PayloadClientConfig) {
        this.config = config;
        this.client = new S3Client({
            region: config.region,
        });
    }

    public async get(s3PointerString: string): Promise<string | undefined> {
        const s3Pointer = JSON.parse(s3PointerString) as S3Pointer;

        const getCommand = new GetObjectCommand({
            Bucket: s3Pointer.bucketName,
            Key: s3Pointer.objectKey,
        });

        const data = (
            await this.client.send(getCommand)
        ).Body?.transformToString();

        await this.delete(s3Pointer);

        return data;
    }

    public async store(params: StoreCommandInput): Promise<string> {
        const putCommand = new PutObjectCommand({
            ...params,
            Bucket: this.config.bucketName,
            Body: params.body,
            Key: params.key,
        });

        await this.client.send(putCommand);

        const pointer: S3Pointer = {
            bucketName: this.config.bucketName,
            objectKey: params.key ?? randomUUID(),
        };

        return JSON.stringify(pointer);
    }

    private async delete(s3Pointer: S3Pointer): Promise<void> {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: s3Pointer.bucketName,
            Key: s3Pointer.objectKey,
        });

        await this.client.send(deleteCommand);
    }
}
