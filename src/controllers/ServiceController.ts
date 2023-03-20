import { accept, validate } from ".";
import { createLogger } from "../logger";
import { API } from "../typings/api";
import User from "../entities/User";

/**
 * Controller in charge of CRUD-operations related to the Service entity.
 */
export default class ServiceController {
  static NAME = "service";
  static LOGGER = createLogger(ServiceController.NAME);

  /**
   * Gets all single user. Takes an optional {@link API.Request.Id} body,
   * defaulting to the user's id if none is given based off of the auth
   * token.
   *
   * @returns the found user on success.
   */
  static get = accept<null, API.Service.PublicService>(
    this,
    // TODO accept with req params
    async (_, req, res) => {
      return undefined;
    },
  );
};
