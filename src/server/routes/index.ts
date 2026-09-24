import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { studentRouter } from './student.routes.js';
import { advisorRouter } from './advisor.routes.js';
import { examRouter } from './exam.routes.js';
import { aiRouter } from './ai.routes.js';
import { crmRouter } from './crm.routes.js';
import { emailRouter } from './email.routes.js';
import { backupRouter } from './backup.routes.js';
import { securityRouter } from './security.routes.js';
import { chatRouter } from './chat.routes.js';
import { toolboxDatabaseRouter } from './toolboxDatabase.routes.js';
import { storageRouter } from './storage.routes.js';
import { timezoneRouter } from './timezone.routes.js';
import { ambientRouter } from './ambient.routes.js';
import { adminUserRouter } from './adminUser.routes.js';

export const apiRouter = Router();

// Mount all modular domain routers
apiRouter.use(authRouter);
apiRouter.use(adminUserRouter);
apiRouter.use(studentRouter);
apiRouter.use(advisorRouter);
apiRouter.use(examRouter);
apiRouter.use(aiRouter);
apiRouter.use(crmRouter);
apiRouter.use(emailRouter);
apiRouter.use(backupRouter);
apiRouter.use(securityRouter);
apiRouter.use(chatRouter);
apiRouter.use(toolboxDatabaseRouter);
apiRouter.use(storageRouter);
apiRouter.use(timezoneRouter);
apiRouter.use(ambientRouter);

export {
  authRouter,
  studentRouter,
  advisorRouter,
  examRouter,
  aiRouter,
  crmRouter,
  emailRouter,
  backupRouter,
  securityRouter,
  chatRouter,
  toolboxDatabaseRouter,
  storageRouter,
  timezoneRouter,
  ambientRouter
};

