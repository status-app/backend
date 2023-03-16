import { Router } from "express";

// TODO maybe we should make that a class?
type NamedRouter = { name: string, router: Router };
export default NamedRouter;
