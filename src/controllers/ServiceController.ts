import { accept, validate } from ".";
import { createLogger } from "../logger";
import { API } from "../typings/api";
import User from "../entities/User";
import { TodoError } from "../errors";

/**
 * Controller in charge of CRUD-operations related to the Service entity.
 */
export default class ServiceController {
  static NAME = "service";
  static LOGGER = createLogger(ServiceController.NAME);

  /**
   * Gets all services.
   *
   * @returns an array of all monitored services.
   */
  static get = accept<null, API.Service.PublicService>(
    this,
    async () => {
      throw new TodoError();
    },
  );
};
