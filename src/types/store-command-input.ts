import { PutObjectCommandInput } from '@aws-sdk/client-s3';

type KEYS_TO_OMIT = 'Body' | 'Bucket' | 'Key';

export interface StoreCommandInput
    extends Omit<PutObjectCommandInput, KEYS_TO_OMIT> {
    body: string;
    key?: string;
}
