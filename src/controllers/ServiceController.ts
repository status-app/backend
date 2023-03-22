import { accept, validate } from ".";
import { createLogger } from "../logger";
import { API } from "../typings/api";
import { TodoError } from "../errors";
import { serviceRepo } from "../data-source";

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
  static get = accept<null, API.Service.PublicService[]>(
    this,
    async () => (
      (await serviceRepo().find())
        .map((svc) => svc.asPublic())
    ),
  );
};
