import { config } from "../../config";

import jwt from "jsonwebtoken";

/**
* The JWT content.
*/
export type SecurityPayload = {
  uid: number;
  login: string;
};

/**
 * Signs the given `payload` to serialize it into a string.
 *
 * @param payload the {@link SecurityPayload} to sign.
 * @param options the potential {@link jwt.SignOptions} to use.
 * @returns a Promise that resolves the payload, or rejects an {@link Error}.
 */
export const serializeSecurityToken = (
  payload: SecurityPayload,
  options?: Omit<jwt.SignOptions, "expiresIn">,
): Promise<string> =>
  new Promise((res, rej) => {
    jwt.sign(
      payload,
      config.jwtSecret,
      { ...options, expiresIn: "1h" },
      (err, token) => (err ? rej(err) : res("Bearer " + token)),
    );
  });

/**
 * Verifies the given `token` to deserialize it into a {@link SecurityPayload}.
 *
 * @param token the token to verify.
 * @param options the potential {@link jwt.VerifyOptions} to use.
 * @returns a Promise that resolves the {@link SecurityPayload}, or rejects
 *          any of {@link jwt.VerifyErrors}.
 */
export const deserializeSecurityToken = (
  token: string,
  options?: jwt.VerifyOptions & { complete: boolean },
): Promise<SecurityPayload> =>
  new Promise((res, rej) => {
    if (!token.startsWith("Bearer ")) return rej("invalid token");

    jwt.verify(
      token.replace("Bearer ", ""),
      config.jwtSecret,
      options,
      (err: jwt.VerifyErrors, payload: jwt.Jwt & SecurityPayload) => (
        err
          ? rej(err)
          : res({ uid: payload.uid, login: payload.login })
      ),
    );
  });
