import 'dotenv/config';
import { createPrivateKey, createPublicKey } from 'node:crypto';

const privatePem = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const publicPem = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
if (!privatePem || !publicPem) {
  throw new Error('Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY in backend/.env.');
}

export const jwtPrivateKey = createPrivateKey(privatePem);
export const jwtPublicKey = createPublicKey(publicPem);

if (jwtPrivateKey.asymmetricKeyType !== 'rsa' || jwtPublicKey.asymmetricKeyType !== 'rsa' ||
    (jwtPrivateKey.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) {
  throw new Error('JWT keys must be RSA keys of at least 2048 bits.');
}
const derivedPublic = createPublicKey(jwtPrivateKey).export({ type: 'spki', format: 'pem' });
if (derivedPublic !== jwtPublicKey.export({ type: 'spki', format: 'pem' })) {
  throw new Error('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be a matching pair.');
}
